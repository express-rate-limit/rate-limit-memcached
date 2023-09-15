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

/**
 * A `Store` for the `express-rate-limit` package that stores hit counts in
 * Memcached.
 */
class MemcachedStore implements Store {
	/**
	 * The number of milliseconds to remember that user's requests.
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
	 * @constructor for `MemcachedStore`.
	 *
	 * @param options {Options} - The options used to configure the store's behaviour.
	 */
	constructor(options?: Partial<Options>) {
		this.prefix = options?.prefix ?? 'rl:'

		if (options?.client) {
			if (
				typeof options.client.get === 'function' &&
				typeof options.client.set === 'function' &&
				typeof options.client.del === 'function' &&
				typeof options.client.incr === 'function' &&
				typeof options.client.decr === 'function'
			)
				this.client = options.client
			else throw new Error('An invalid memcached client was passed to store.')
		} else
			this.client = new Memcached(
				options?.locations ?? ['localhost:11211'],
				options?.config ?? {},
			)
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
	 * Method to suffix the keys with `__expiry`, which is the name of the key used
	 * to store the reset timestamp for that key.
	 *
	 * @param key {string} - The key.
	 *
	 * @returns {string} - The key + '__expiry'.
	 */
	expirySuffix(key: string): string {
		return `${key}__expiry`
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
		const getKey = promisify(this.client.get).bind(this.client)
		const setKey = promisify(this.client.set).bind(this.client)
		const incrementKey = promisify(this.client.incr).bind(this.client)

		// Try incrementing the given key. If the key exists, it will increment it
		// and return the updated hit count.
		// @ts-expect-error `incrementKey` returns a number or a boolean, not void.
		// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
		let totalHits = (await incrementKey(prefixedKey, 1)) as number | boolean
		let expiresAt

		if (totalHits === false) {
			// The increment command failed since the key does not exist. In which case, set the
			// hit count for that key to 1, and make sure it expires after `window` seconds.
			await setKey(prefixedKey, 1, this.expiration)
			totalHits = 1 // When you set it to 1, it returns `true` for some reason.

			// Also store the expiration time in a separate key.
			expiresAt = Date.now() + this.expiration
			await setKey(
				this.expirySuffix(prefixedKey), // The name of the key.
				expiresAt, // The value - the time at which the key expires.
				this.expiration, // The key should be deleted by memcached after `window` seconds.
			)
		} else {
			// If the key exists and has been incremented succesfully, retrieve its expiry.
			expiresAt = (await getKey(this.expirySuffix(prefixedKey))) as number
		}

		if (typeof totalHits !== 'number')
			throw new Error(
				`Expected 'totalHits' to be a number, got ${totalHits} instead.`,
			)

		// Return the total number of hits, as well as the reset timestamp.
		return {
			totalHits,
			resetTime: expiresAt === undefined ? undefined : new Date(expiresAt),
		}
	}

	/**
	 * Method to decrement a client's hit counter.
	 *
	 * @param key {string} - The identifier for a client
	 */
	async decrement(key: string): Promise<void> {
		const prefixedKey = this.prefixKey(key)
		const decrementKey = promisify(this.client.decr).bind(this.client)

		// Decrement the key, and do nothing if it doesn't exist.
		await decrementKey(prefixedKey, 1)
	}

	/**
	 * Method to reset a client's hit counter.
	 *
	 * @param key {string} - The identifier for a client.
	 */
	async resetKey(key: string): Promise<void> {
		const prefixedKey = this.prefixKey(key)
		const deleteKey = promisify(this.client.del).bind(this.client)

		// Delete the the key, as well as its expiration counterpart.
		await deleteKey(prefixedKey)
		await deleteKey(this.expirySuffix(prefixedKey))
	}
}

// Export it to the world!
export default MemcachedStore
