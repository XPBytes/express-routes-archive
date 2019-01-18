import { Request } from 'express'
import test from 'tape'

import { RoutesArchive } from '../src/RoutesArchive'

const root = new RoutesArchive()
root.register('foo', '/test')
root.register(
  'bar',
  (mountedAt: string, arg: any) => `${mountedAt}/test?bar=${arg}`
)
const up = new RoutesArchive('/level', root)
up.register('level', '/two')
up.register('penthouse', (mountedAt: string) => `${mountedAt}/over-9000`)

test('it generates path', (t) => {
  t.equals(root.path('foo'), '/test')
  t.end()
})

test('it generates path from function', (t) => {
  t.equals(root.path('bar', 'baz'), '/test?bar=baz')
  t.end()
})

test('it generates path cascadingly', (t) => {
  t.equals(root.path('level'), '/level/two')
  t.end()
})

test('it generates path cascadingly from function', (t) => {
  t.equals(root.path('penthouse'), '/level/over-9000')
  t.end()
})

test('it shares routes in chain', (t) => {
  t.equals(up.path('foo'), '/test')
  t.end()
})

test('it generates url', (t) => {
  const fakeRequest = ({
    hostname: 'test.xpbytes.com',
    socket: { port: 80 }
  } as unknown) as Request
  t.equals(
    root.url('level', fakeRequest).toString(),
    'http://test.xpbytes.com/level/two'
  )
  t.end()
})

test('it can generate https urls (via constructor)', (t) => {
  const fakeRequest = ({
    hostname: 'test.xpbytes.com',
    socket: { port: 443 }
  } as unknown) as Request
  const secure = new RoutesArchive(undefined, undefined, true)
  secure.register('lock', '/locked')
  t.equals(
    secure.url('lock', fakeRequest).toString(),
    'https://test.xpbytes.com/locked'
  )
  t.end()
})

test('it can generate https urls (via env)', (t) => {
  process.env.SSL_ENABLED = '1'
  const fakeRequest = ({
    hostname: 'test.xpbytes.com',
    socket: { port: 443 }
  } as unknown) as Request
  const secure = new RoutesArchive()
  secure.register('lock', '/locked')
  t.equals(
    secure.url('lock', fakeRequest).toString(),
    'https://test.xpbytes.com/locked'
  )
  t.end()
})

test('it can have a hostname (via constructor)', (t) => {
  const fakeRequest = ({
    hostname: 'nope.xpbytes.com',
    socket: { port: 443 }
  } as unknown) as Request
  const secure = new RoutesArchive(
    undefined,
    undefined,
    undefined,
    'https://alternate.xpbytes.com/mount-path/'
  )
  secure.register('lock', '/locked')
  t.equals(
    secure.url('lock', fakeRequest).toString(),
    'https://alternate.xpbytes.com/mount-path/locked'
  )
  t.end()
})

test('it can have a hostname (via env)', (t) => {
  process.env.SERVER_URL = 'https://alternate.xpbytes.com/mount-path/'

  const fakeRequest = ({
    hostname: 'nope.xpbytes.com',
    socket: { port: 443 }
  } as unknown) as Request
  const secure = new RoutesArchive()
  secure.register('lock', '/locked')
  t.equals(
    secure.url('lock', fakeRequest).toString(),
    'https://alternate.xpbytes.com/mount-path/locked'
  )
  t.end()
})
