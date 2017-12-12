import Test from 'ava'
import * as TD from 'testdouble'
import * as Memcached from 'memcached'
import MemcachedStore from './memcached-store'

Test('.constructor sets as default members when no arguments', (t) => {
  const m = new MemcachedStore()
  t.is(m.prefix, 'rl:')
  t.is(m.expiration, 15 * 60)
  t.true(m.client instanceof Memcached)
})

Test('.constructor sets members when gave arguments', (t) => {
  const prefix = 'yo:'
  const expiration = 10
  const hosts = ['foobar.example.com']
  const client = new Memcached(hosts)
  const m = new MemcachedStore({ prefix, expiration, client })
  t.is(m.prefix, 'yo:')
  t.is(m.expiration, 10)
  t.is(m.client.servers, hosts)
})

Test('#incr calls client.increment and client.set when at first time', (t) => {
  const memcached = TD.constructor(Memcached)
  TD.when(memcached.prototype.increment('rl:key', 1, TD.callback(null, false))).thenReturn()
  TD.when(memcached.prototype.set('rl:key', 15 * 60, 1, TD.callback(null, true))).thenReturn()
  const client = new memcached
  const m = new MemcachedStore({ client })
  m.incr('key', (err: any, num: number) => {
    t.is(err, null)
    t.is(num, 1)
  })
  t.is(TD.explain(memcached.prototype.increment).callCount, 1)
  t.is(TD.explain(memcached.prototype.set).callCount, 1)
})

Test('#incr calls client.increment when after the second time', (t) => {
  const memcached = TD.constructor(Memcached)
  TD.when(memcached.prototype.increment('rl:key', 1, TD.callback(null, 2))).thenReturn()
  const client = new memcached
  const m = new MemcachedStore({ client })
  m.incr('key', (err: any, num: number) => {
    t.is(err, null)
    t.is(num, 2)
  })
  t.is(TD.explain(memcached.prototype.increment).callCount, 1)
})

Test('#resetKey calls client.del', (t) => {
  const memcached = TD.constructor(Memcached)
  TD.when(memcached.prototype.del('rl:key')).thenReturn()
  const client = new memcached
  const m = new MemcachedStore({ client })
  m.resetKey('key')
  t.is(TD.explain(memcached.prototype.del).callCount, 1)
})
