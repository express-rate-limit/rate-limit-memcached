// /test/options-test.ts
// The tests for option handling.

import MockMemcached from 'memcached-mock'
import DefaultMemcached from 'memcached'
import { it, expect } from '@jest/globals'
import { MemcachedStore } from '../source/index.js'
import './types.js' // eslint-disable-line import/no-unassigned-import

it('should set default values when no arguments are passed to constructor', () => {
	const options = {}

	let store = new MemcachedStore(options)
	expect(store.prefix).toBe('rl:')
	expect(store.client instanceof DefaultMemcached).toBe(true)

	store = new MemcachedStore()
	expect(store.prefix).toBe('rl:')
	expect(store.client instanceof DefaultMemcached).toBe(true)
})

it('should accept arguments over default values', () => {
	const options = { prefix: '42-', client: new MockMemcached('foo.bar') }
	const store = new MemcachedStore(options)

	expect(store.prefix).toBe(options.prefix)
	expect(store.client).toBe(options.client)
})

it('should throw when a client is invalid', () => {
	const client = { set: (error: any) => false, get: 24 }
	// @ts-expect-error Catch the error without TSC.
	const createInvalidStore = () => new MemcachedStore({ client })

	expect(createInvalidStore).toThrow()
})
