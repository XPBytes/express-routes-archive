# Express Routes Archive

[![Build Status](https://travis-ci.com/XPBytes/express-routes-archive.svg?branch=master)](https://travis-ci.com/XPBytes/express-routes-archive)

[![NPM Package Version](https://badge.fury.io/js/@xpbytes%2Fexpress-routes-archive.svg)](https://npmjs.org/package/@xpbytes/express-routes-archive)

Utility class to register routes and dynamically generate their URL or path from anywhere in the express app

```bash
yarn add @xpbytes/express-routes-archive
```

```typescript
import { RoutesArchive } from '@xpbytes/express-routes-archive'

const root = new RoutesArchive()
root.register('foo', '/test')
root.register('bar', (mountedAt: string, arg: any) => `${mountedAt}/test?bar=${arg}`)

// For example you can create these when you mount a new "Router" and pass it along
// the routes are shared among archives in the chain.
const up = new RoutesArchive('/level', root)
up.register('level', '/two')
up.register('penthouse', (mountedAt: string) => `${mountedAt}/over-9000`)

root.path('bar', 'my-arg')
// => /test?bar=my-arg

root.url('penthouse', req)
// => https://test.xpbytes.com/level/over-9000
```

You can use `SSL_ENABLED` to make generated urls `https`.
You can use `SERVER_URL` to mount the path onto that URL instead of the request hostname.
