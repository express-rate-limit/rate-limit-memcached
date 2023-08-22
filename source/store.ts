// /source/store.ts
// A `memcached` store for the `express-rate-limit` middleware.

import type {
	Store,
	Options as RateLimitConfiguration,
	IncrementResponse,
} from 'express-rate-limit'
import Memcached from 'memcached'
import type { Options, MemcachedClient } from './types'

/**
 * The hit count and start window timestamp of a client.
 */
type ClientRecord = { hits: number; time: number } // [in milliseconds]

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
				typeof options.client.add === 'function' &&
				typeof options.client.replace === 'function' &&
				typeof options.client.del === 'function'
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
	 * Method to increment a client's hit counter.
	 *
	 * @param key {string} - The identifier for a client.
	 *
	 * @returns {IncrementResponse} - The number of hits and reset time for that client.
	 */
	async increment(key: string): Promise<IncrementResponse> {
		const response = (await this.updateKey(
			this.prefixKey(key),
			+1,
		)) as IncrementResponse // We can cast this for sure because we're passing delta as +1
		return response
	}

	/**
	 * Method to decrement a client's hit counter.
	 *
	 * @param key {string} - The identifier for a client
	 */
	async decrement(key: string): Promise<void> {
		await this.updateKey(this.prefixKey(key), -1)
	}

	/**
	 * Method to reset a client's hit counter.
	 *
	 * @param key {string} - The identifier for a client.
	 */
	async resetKey(key: string): Promise<void> {
		const prefixedKey = this.prefixKey(key)

		// Delete the record for that key.
		await new Promise<void>((resolve, reject) => {
			this.client.del(prefixedKey, (error) => {
				if (error) {
					reject(error)
					return
				}

				resolve()
			})
		})
	}

	private async updateKey(
		key: string,
		delta: number,
	): Promise<IncrementResponse | void> {
		// Find the existing record for that key.
		let record = await new Promise<ClientRecord>((resolve, reject) => {
			this.client.get(key, (error, data) => {
				if (error) {
					reject(error)
					return
				}

				resolve(data as ClientRecord)
			})
		})

		if (record === undefined && delta < 0) {
			// If the record does not exist, and we are supposed to decrement the key,
			// we don't need to do anything, so we return.
			return
		}

		if (record === undefined) {
			// If a record does not exist, and must be incremented, then add a record
			// for that key.
			record = await new Promise<ClientRecord>((resolve, reject) => {
				const payload: ClientRecord = { hits: 1, time: Date.now() }

				this.client.add(key, payload, this.expiration, (error) => {
					if (error) {
						reject(error)
						return
					}

					resolve(payload)
				})
			})
		} else {
			// If it does exist, simply change the hit count by `delta`.
			record = await new Promise<ClientRecord>((resolve, reject) => {
				const payload: ClientRecord = { ...record, hits: record.hits + delta }
				const expiration = Math.floor(
					// = window - (time elapsed since start of window) [in seconds]
					this.expiration - (Date.now() - payload.time) / 1000,
				)

				this.client.replace(key, payload, expiration, (error) => {
					if (error) {
						reject(error)
						return
					}

					resolve(payload)
				})
			})
		}

		// Return the total number of hits and the time left for the window to reset.
		return {
			totalHits: record.hits,
			resetTime: new Date(record.time + this.expiration * 1000),
		}
	}
}

// Export it to the world!
export default MemcachedStore
