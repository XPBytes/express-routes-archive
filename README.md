# Express Routes Archive

[![npm](https://github.com/XPBytes/express-routes-archive/workflows/npm/badge.svg)](https://github.com/XPBytes/express-routes-archive/actions?query=workflow%3Anpm) [![NPM Package Version](https://badge.fury.io/js/@xpbytes%2Fexpress-routes-archive.svg)](https://npmjs.org/package/@xpbytes/express-routes-archive) [![Maintainability](https://api.codeclimate.com/v1/badges/767c9b87de0dd450dfa7/maintainability)](https://codeclimate.com/github/XPBytes/express-routes-archive/maintainability)

Utility class to register routes and dynamically generate their URL or path from anywhere in the express app.

## Installation

```bash
yarn add @xpbytes/express-routes-archive
```

It has the following peer dependencies:

```bash
yarn add @types/express @types/express-serve-static-core @types/node -D
```

## Usage

```typescript
import { RoutesArchive } from '@xpbytes/express-routes-archive'

const root = new RoutesArchive()
root.register('foo', '/test')
root.register(
  'bar',
  (mountedAt: string, arg: any) => `${mountedAt}/test?bar=${arg}`
)

root.path('test')
// => /test

root.path('bar', 'my-arg')
// => /test?bar=my-arg
```

When you have a sub-router / controller, create a new `RoutesArchive`, passing in the original and the mount path:

```typescript
const up = new RoutesArchive('/level', root)
up.register('level', '/two')
up.register('penthouse', (mountedAt: string) => `${mountedAt}/over-9000`)

up.path('level')
// => /level/two

root.path('level')
// => /level/two
```

Use `RoutesArchive#url(route, req)` to generate full urls instead of path only:

```typescript
root.url('penthouse', req)
// => https://test.xpbytes.com/level/over-9000
```

## Configuration

- `SSL_ENABLED` env to thruthy to make generated urls `https`.
- `SERVER_URL` env to mount the path onto that URL instead of the request hostname.
