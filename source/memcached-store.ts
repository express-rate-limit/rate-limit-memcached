// /source/memcached-store.ts
// A `memcached` store for the `express-rate-limit` middleware.

import { promisify } from 'node:util'
import type {
	Store,
	Options as RateLimitConfiguration,
	IncrementResponse,
} from 'express-rate-limit'
import Memcached from 'memcached'
import type { Options, MemcachedClient } from './types'

// A list of methods that should be present on a client object.
const methods: Array<keyof MemcachedClient> = [
	'del',
	'get',
	'set',
	'add',
	'incr',
	'decr',
]

/**
 * The promisifed version of the `MemcachedClient`.
 */
type PromisifiedMemcachedClient = {
	get: <T>(key: string) => Promise<T>
	set: (key: string, value: any, time: number) => Promise<boolean>
	add: (key: string, value: any, time: number) => Promise<boolean>
	del: (key: string) => Promise<boolean>
	incr: (key: string, amount: number) => Promise<boolean | number>
	decr: (key: string, amount: number) => Promise<boolean | number>
}

/**
 * A `Store` for the `express-rate-limit` package that stores hit counts in
 * Memcached.
 */
class MemcachedStore implements Store {
	/**
	 * The number of seconds to remember a client's requests.
	 */
	expiration!: number

	/**
	 * The text to prepend to the key.
	 */
	prefix!: string

	/**
	 * The `memcached` client to use.
	 */
	client!: MemcachedClient

	/**
	 * The promisifed functions from the `client` object.
	 */
	fns!: PromisifiedMemcachedClient

	/**
	 * @constructor for `MemcachedStore`.
	 *
	 * @param options {Options} - The options used to configure the store's behaviour.
	 */
	constructor(options?: Partial<Options>) {
		this.prefix = options?.prefix ?? 'rl:'

		if (options?.client) {
			for (const func of methods) {
				if (typeof options.client[func] !== 'function')
					throw new Error('An invalid memcached client was passed to store.')
			}

			this.client = options.client
		} else {
			this.client = new Memcached(
				options?.locations ?? ['localhost:11211'],
				options?.config ?? {},
			)
		}

		// Promisify the functions.
		// @ts-expect-error This line simply initialises the object, calm down lol.
		this.fns = {}
		for (const func of methods) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			this.fns[func] = promisify(this.client[func]).bind(this.client)
		}
	}

	/**
	 * Method that actually initializes the store.
	 *
	 * @param options {RateLimitConfiguration} - The options used to setup the middleware.
	 *
	 * @impl
	 */
	init(options: RateLimitConfiguration) {
		this.expiration = options.windowMs / 1000 // [in seconds]
	}

	/**
	 * Method to prefix the keys with the given text.
	 *
	 * @param key {string} - The key.
	 *
	 * @returns {string} - The text + the key.
	 */
	prefixKey(key: string): string {
		return `${this.prefix}${key}`
	}

	/**
	 * Method that returns the name of the key used to store the reset timestamp
	 * for the given key.
	 *
	 * @param key {string} - The key.
	 *
	 * @returns {string} - The expiry key's name.
	 */
	expiryKey(key: string): string {
		return `${this.prefix}expiry:${key}`
	}

	/**
	 * Method to increment a client's hit counter.
	 *
	 * @param key {string} - The identifier for a client.
	 *
	 * @returns {IncrementResponse} - The number of hits and reset time for that client.
	 */
	async increment(key: string): Promise<IncrementResponse> {
		const prefixedKey = this.prefixKey(key)

		// Try incrementing the given key. If the key exists, it will increment it
		// and return the updated hit count.
		let totalHits = await this.fns.incr(prefixedKey, 1)
		let expiresAt

		if (totalHits === false) {
			// The increment command failed since the key does not exist. In which case, set the
			// hit count for that key to 1, and make sure it expires after `window` seconds.
			await this.fns.set(prefixedKey, 1, this.expiration)
			totalHits = 1 // When you set it to 1, it returns `true` for some reason.

			// Also store the expiration time in a separate key.
			expiresAt = Date.now() + this.expiration * 1000 // [seconds -> milliseconds]
			await this.fns.set(
				this.expiryKey(key), // The name of the key.
				expiresAt, // The value - the time at which the key expires.
				this.expiration, // The key should be deleted by memcached after `window` seconds.
			)
		} else {
			// If the key exists and has been incremented succesfully, retrieve its expiry.
			expiresAt = await this.fns.get<number>(this.expiryKey(key))
		}

		if (typeof totalHits !== 'number')
			throw new Error(
				`Expected 'totalHits' to be a number, got ${totalHits} instead.`,
			)

		// Return the total number of hits, as well as the reset timestamp.
		return {
			totalHits,
			// If `expiresAt` is undefined, assume the key expired sometime in between
			// reading the hits and expiry keys from memcached.
			resetTime: expiresAt ? new Date(expiresAt) : new Date(),
		}
	}

	/**
	 * Method to decrement a client's hit counter.
	 *
	 * @param key {string} - The identifier for a client
	 */
	async decrement(key: string): Promise<void> {
		// Decrement the key, and do nothing if it doesn't exist.
		await this.fns.decr(this.prefixKey(key), 1)
	}

	/**
	 * Method to reset a client's hit counter.
	 *
	 * @param key {string} - The identifier for a client.
	 */
	async resetKey(key: string): Promise<void> {
		// Delete the the key, as well as its expiration counterpart.
		await this.fns.del(this.prefixKey(key))
		await this.fns.del(this.expiryKey(key))
	}
}

// Export it to the world!
export default MemcachedStore
