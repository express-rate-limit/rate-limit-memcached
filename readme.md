# <div align="center"> Express Rate Limit - Memcached Store </div>

<div align="center">

[![tests](https://github.com/express-rate-limit/rate-limit-memcached/actions/workflows/ci.yaml/badge.svg)](https://github.com/express-rate-limit/rate-limit-memcached/actions/workflows/ci.yaml)
[![npm version](https://img.shields.io/npm/v/rate-limit-memcached.svg)](https://npmjs.org/package/rate-limit-memcached 'View this project on NPM')
[![npm downloads](https://img.shields.io/npm/dm/rate-limit-memcached)](https://www.npmjs.com/package/rate-limit-memcached)

A [memcached](https://memcached.org) store for the
[express-rate-limit](https://github.com/express-rate-limit/express-rate-limit)
middleware.

</div>

## Installation

From the npm registry:

```sh
# Using npm
> npm install express-rate-limit
# Using yarn or pnpm
> yarn/pnpm add express-rate-limit
```

From Github Releases:

```sh
# Using npm
> npm install https://github.com/express-rate-limit/rate-limit-memcached/releases/download/v{version}/rate-limit-memcached.tgz
# Using yarn or pnpm
> yarn/pnpm add https://github.com/express-rate-limit/rate-limit-memcached/releases/download/v{version}/rate-limit-memcached.tgz
```

Replace `{version}` with the version of the package that you want to your, e.g.:
`1.0.0`.

## Usage

**This package requires you to use Node 16 or above.**

An example of its usage is as follows:

```ts
import { rateLimit } from 'express-rate-limit'
import { MemcachedStore } from 'rate-limit-memcached'

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes.
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // Return rate limit info in the `RateLimit` header.
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	store: new MemcachedStore({
		// prefix: 'rl:', // The prefix attached to all keys stored in the cache.
		locations: ['localhost:11211'], // The server location(s), passed directly to Memcached.
	}),
})

// Apply the rate limiting middleware to all requests
app.use(limiter)
```

## Configuration

### `prefix`

> `string`

The text to prepend to all keys stored by this package in Memcached.

Defaults to `rl:`.

### `client`

> `MemcachedClient`

The client used to make requests to the Memcached server. Must have the
following methods:

- `get: (key, callback)`
- `del: (key, callback)`
- `set: (key, value, lifetime, callback)`
- `add: (key, value, lifetime, callback)`
- `incr: (key, delta, callback)`
- `decr: (key, delta, callback)`

> Here, `key` is a string, `value` and `delta` are numbers, and `lifetime` is
> the time in seconds until it expires.

Defaults to an instance of [`memcached`](https://github.com/3rd-Eden/memcached),
created with the `locations` and `config` options (see below for details) passed
to it.

### `locations`

A list of memcached servers to store the keys in, passed to the default
Memcached client.

Note that the default client is only used if an alternative `client` is not
passed to the store.

Defaults to `['localhost:11211']`.

### `config`

> `object`

The configuration passed to the default Memcached client.

Defaults to `{}`.

## Issues and Contributing

If you encounter a bug or want to see something added/changed, please go ahead
and
[open an issue](https://github.com/express-rate-limitedly/rate-limit-memcached/issues/new)!
If you need help with something, feel free to
[start a discussion](https://github.com/express-rate-limit/rate-limit-memcached/discussions/new)!

If you wish to contribute to the library, thanks! First, please read
[the contributing guide](contributing.md). Then you can pick up any issue and
fix/implement it!

## License

MIT © [Tomohisa Oda](http://github.com/linyows),
[Nathan Friedly](http://nfriedly.com) and
[Vedant K](https://github.com/gamemaker1)
