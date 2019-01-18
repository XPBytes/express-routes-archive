export class RouteNotRegistered extends Error {
  public missingRoute: string
  public knownRoutes: string[]

  constructor(missingRoute: string, knownRoutes: string[]) {
    const message = `Route '${missingRoute}' not registered. Registered are: ${knownRoutes}}`
    super(message)

    Error.captureStackTrace(this, this.constructor)

    this.missingRoute = missingRoute
    this.knownRoutes = knownRoutes
  }
}
