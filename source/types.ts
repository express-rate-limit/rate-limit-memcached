// /source/types.ts
// The type definitions for this package.

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
}
