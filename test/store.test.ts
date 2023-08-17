// Test/store.test.ts
// The tests for the store.

import { MemcachedStore } from '../source/index.js'

const store = new MemcachedStore()

store.init({ windowMs: 15 * 60 * 1000 })

const response = await store.increment('foo')
console.log('hi', response)
