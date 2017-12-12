import test from 'ava'
import MemcachedStore from './memcached-store'

test('.constructor sets default', (t) => {
  const m = new MemcachedStore({})
  t.is(m.prefix, 'rl:')
  t.is(m.expiration, 15 * 60)
})
