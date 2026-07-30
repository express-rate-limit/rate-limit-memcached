// /test/types.ts
// Setup the types for `memcached-mock`

declare module 'memcached-mock' {
	// Moving the import INSIDE the declaration prevents the file
	// from becoming a local module, making this an ambient declaration instead.
	import Memcached from 'memcached'

	class MemcachedMock extends Memcached {
		constructor(server: string | string[], options?: Memcached.options)
	}

	export default MemcachedMock
}
