import { Request } from 'express'
import nodeUrl from 'url'

import { RouteNotRegistered } from './RouteNotRegistered'

export type PathGenerator =
  | string
  | ((mountedAt: string, ...args: any[]) => string)
type RouteGenerator = (args: any[]) => string

export interface RoutesArchiveBase {
  mountedAt: undefined | string
  routes: { [P: string]: RouteGenerator }
}

const READ_ONLY_ROUTES = {}
const EMPTY_BASE: RoutesArchiveBase = {
  mountedAt: undefined,
  routes: READ_ONLY_ROUTES
}

export class RoutesArchive implements RoutesArchiveBase {
  public mountedAt: string
  public routes: { [P: string]: RouteGenerator }

  private ssl: boolean
  private serverUrl?: string

  /**
   * Creates an instance of RoutesArchive.
   *
   * @param {RoutesArchiveBase} [base=EMPTY_BASE]
   * @param {string} [mountedAt] path this is mounted at
   * @memberof RoutesArchive
   */
  constructor(
    mountedAt?: string,
    base: RoutesArchiveBase = EMPTY_BASE,
    ssl: string | boolean | undefined = process.env.SSL_ENABLED,
    serverUrl: string | undefined = process.env.SERVER_URL
  ) {
    this.mountedAt = [base.mountedAt, mountedAt].filter(Boolean).join('')
    this.routes = base.routes === READ_ONLY_ROUTES ? {} : base.routes

    this.ssl = !!ssl
    this.serverUrl = serverUrl
  }

  /**
   * Register a route
   *
   * @param {string} route name of the route
   * @param {PathGenerator} generatePath the function that generates the correct path, given a set of arguments. If the
   *  path is static, may also be a static string. When called, will prefix with all the {mountedAt} up the chain.
   *
   * @memberof RoutesArchive
   */
  public register(route: string, generatePath: PathGenerator) {
    this.routes[route] = (args: any[]) => {
      return this.callOrReturn(generatePath, this.mountedAt, ...args).toString()
    }
  }

  /**
   * Generates the URL for a route
   *
   * @param {string} route the route to generate for
   * @param {Request} req the current request (used if serverUrl is not set)
   * @param {...any[]} args the arguments to pass to the route generation
   * @returns {nodeUrl.URL} the url
   * @memberof RoutesArchive
   */
  public url(route: string, req: Request, ...args: any[]): nodeUrl.URL {
    const baseUrl =
      this.serverUrl ||
      nodeUrl.format({
        hostname: req.hostname,
        port: req.socket.localPort,
        protocol: this.ssl ? 'https' : 'http'
      })

    return new nodeUrl.URL(`.${this.path(route, ...args)}`, baseUrl)
  }

  /**
   * Generates the path for a route
   *
   * @param {string} route the route to generate for
   * @param {...any[]} args the arguments to pass to the route generation
   * @returns {string} the path
   * @memberof RoutesArchive
   */
  public path(route: string, ...args: any[]): string {
    this.assertExists(route)
    return this.routes[route](args)
  }

  private assertExists(route: string) {
    if (!this.routes[route]) {
      throw new RouteNotRegistered(route, Object.keys(this.routes))
    }
  }

  private callOrReturn(opt: PathGenerator, mountedAt: string, ...args: any[]) {
    if (typeof opt === 'string' || typeof opt === 'object') {
      return mountedAt + opt
    }

    return opt(mountedAt, ...args)
  }
}
