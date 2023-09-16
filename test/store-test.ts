// /test/store-test.ts
// The tests for the increment, decrement and resetKey functions.

import Memcached from 'memcached-mock'
import { it, expect, jest } from '@jest/globals'
import { MemcachedStore } from '../source/index.js'
import './types.js' // eslint-disable-line import/no-unassigned-import

// Return the same spied-on instance of the store for the tests.
const getStore = async (): Promise<MemcachedStore> => {
	// Create a new client instance, and clear its cache. Somehow the cache from
	// the previous test carries over unless we call flush here.
	const client = new Memcached('localhost:11211')
	await new Promise<void>((resolve, reject) => {
		client.flush((error) => {
			if (error) {
				reject(error)
				return
			}

			resolve()
		})
	})

	// Spy on all the functions so we can make sure they are called.
	jest.spyOn(client, 'get')
	jest.spyOn(client, 'set')
	jest.spyOn(client, 'add')
	jest.spyOn(client, 'incr')
	jest.spyOn(client, 'decr')
	jest.spyOn(client, 'del')

	// Create an new store and initialise it.
	const store = new MemcachedStore({ client })
	// @ts-expect-error We only need to pass the `windowMs` option.
	store.init({ windowMs: 2 * 1000 })
	return store
}

it('should work when `increment` is called for new key', async () => {
	const store = await getStore()
	const data = await store.increment('1.2.3.4')

	expect(data.totalHits).toBe(1)
	expect(data.resetTime instanceof Date).toBe(true)

	expect(store.client.incr).toHaveBeenCalled()
	expect(store.client.add).toHaveBeenCalledTimes(2)
})

it('should work when `increment` is called for existing key', async () => {
	const store = await getStore()

	await store.increment('1.2.3.4')
	await store.increment('1.2.3.4')

	const data = await store.increment('1.2.3.4')

	expect(data.totalHits).toBe(3)
	expect(data.resetTime instanceof Date).toBe(true)
})

it('should still call `decr` when `decrement` is called for non-existent key', async () => {
	const store = await getStore()

	await store.decrement('1.2.3.4')

	expect(store.client.decr).toHaveBeenCalled()
})

it('should work when `decrement` is called for existing key', async () => {
	const store = await getStore()

	await store.increment('1.2.3.4')
	await store.decrement('1.2.3.4')

	expect(store.client.decr).toHaveBeenCalled()
})

it('should work when `resetKey` is called for existing key', async () => {
	const store = await getStore()

	await store.increment('1.2.3.4')
	await store.resetKey('1.2.3.4')

	expect(store.client.del).toHaveBeenCalledTimes(2) // Once for the key, once for the `key__expiry`.
})

it('should still call `del` when `resetKey` is called for non-existent key', async () => {
	const store = await getStore()

	await store.resetKey('1.2.3.4')

	expect(store.client.del).toHaveBeenCalledTimes(2)
})
