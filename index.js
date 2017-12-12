'use strict';

const MemcachedStore = require('./lib/memcached-store').default;

module.exports = MemcachedStore

// Allow use of default import syntax in TypeScript
module.exports.default = MemcachedStore
