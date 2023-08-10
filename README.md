Rate Limit Memcached
====================

Memcached client for the [express-rate-limit](https://github.com/nfriedly/express-rate-limit) middleware.

<a href="https://www.npmjs.com/package/rate-limit-memcached" title="npm"><img src="http://img.shields.io/npm/v/rate-limit-memcached.svg?style=for-the-badge"></a>
<a href="https://travis-ci.org/linyows/rate-limit-memcached" title="travis"><img src="https://img.shields.io/travis/linyows/rate-limit-memcached.svg?style=for-the-badge"></a>
<a href="https://coveralls.io/github/linyows/rate-limit-memcached" title="coveralls"><img src="https://img.shields.io/coveralls/linyows/rate-limit-memcached.svg?style=for-the-badge"></a>
<a href="https://github.com/linyows/rate-limit-memcached/blob/master/MIT-LICENSE" title="MIT License"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge"></a>

Installation
------------

```sh
$ npm install --save rate-limit-memcached
```

Usage
-----

### Node.js

```js
var RateLimit = require('express-rate-limit');
var Memcached = require('memcached');
var MemcachedStore = require('rate-limit-memcached');

var client = new Memcached(['memcached.example.com:11211']);
var expiration = 20 * 60;
var limiter = new RateLimit({
  store: new MemcachedStore({ expiration: expiration, client: client, prefix: 'remoteip:' }),
  windowMs: expiration * 1000,
  max: 500,
  delayMs: 0
});

app.use(limiter);
```

### TypeScript

```ts
import * as RateLimit from 'express-rate-limit'
import * as Memcached from 'memcached'
import MemcachedStore from 'rate-limit-memcached'

const client = new Memcached(['memcached.example.com:11211'])
const expiration = 20 * 60
const limiter = new RateLimit({
  store: new MemcachedStore({ expiration, client, prefix: 'remoteip:' }),
  windowMs: expiration * 1000,
  max: 500,
  delayMs: 0
})

app.use(limiter)
```

Contribution
------------

1. Fork (https://github.com/linyows/rate-limit-memcached/fork)
1. Create a feature branch
1. Commit your changes
1. Rebase your local changes against the master branch
1. Install dependencies with the `npm ci` command
1. Run test suite with the `npm test` command and confirm that it passes
1. Create a new Pull Request

Author
------

[linyows](https://github.com/linyows)
