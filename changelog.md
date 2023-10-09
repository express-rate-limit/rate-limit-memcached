# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.1](https://github.com/express-rate-limit/rate-limit-redis/releases/tag/v1.0.1)

### Added

- Enabled provenance statement generation, see
  https://github.com/express-rate-limit/express-rate-limit#406.

## [1.0.0](https://github.com/express-rate-limit/rate-limit-memcached/releases/tag/v1.0.0)

### Breaking

- Rewrite the store to implement the new `Store` interface, introduced in
  `express-rate-limit` v6.0.0.
- Require the `del`, `get`, `set`, `add`, `incr` and `decr` functions on any
  `memcached` client passed to the store.
- `MemcachedStore` is now a named export, not a default export, to make it play
  nice with the dual cjs-esm package.

### Added

- Add the `locations` and `config` options.
- Store expiry time for a client in a new key, named `${prefix}expiry:${key}`.
