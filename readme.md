# <div align="center"> Express Rate Limit - Memcached Store </div>

<div align="center">

[![tests](https://github.com/express-rate-limit/rate-limit-memcached/actions/workflows/ci.yaml/badge.svg)](https://github.com/express-rate-limit/rate-limit-memcached/actions/workflows/ci.yaml)
[![npm version](https://img.shields.io/npm/v/rate-limit-memcached.svg)](https://npmjs.org/package/rate-limit-memcached 'View this project on NPM')
[![npm downloads](https://img.shields.io/npm/dm/rate-limit-memcached)](https://www.npmjs.com/package/rate-limit-memcached)

A memcached store for the
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
`2.0.0`.

## Usage

> This package, from version `2.0.0` onwards, is a
> [pure `esm` package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
> This means you cannot `require` it in `cjs` projects anymore. Please see the
> linked article for more information.

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
		// client: new Memcached(['foo.bar', 'localhost:11211']) // The memcached client to use.
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

- `get: (string, callback)`
- `add: (string, any, number, callback)`
- `replace: (string, any, number, callback)`
- `del: (string, callback)`

Defaults to [`new Memcached()`](https://github.com/3rd-Eden/memcached).

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

MIT © [Tomohisa Oda](http://github.com/linyows)
