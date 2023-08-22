// /source/types.ts
// The type definitions for this package.

import type Memcached from 'memcached'

/**
 * A memcached client.
 */
export type MemcachedClient = {
	get: (key: string, callback: (error: any, data: any) => void) => void
	add: (
		key: string,
		value: any,
		time: number,
		callback: (error: any) => void,
	) => void
	replace: (
		key: string,
		value: any,
		time: number,
		callback: (error: any) => void,
	) => void
	del: (key: string, callback: (error: any) => void) => void
}

/**
 * The configuration options for the store.
 */
export type Options = {
	/**
	 * The text to prepend to the key.
	 */
	prefix: string

	/**
	 * The `memcached` client to use.
	 */
	client: MemcachedClient

	/**
	 * A list of memcached server URLs to store the keys in, passed to the default
	 * memcached client.
	 *
	 * Note that the default client is only used if another client is not passed
	 * to the store.
	 */
	locations: string[]

	/**
	 * The configuration to pass to the default client, along with the `locations`.
	 */
	config: Memcached.options
}
