import type * as express from 'express'
import type BodyParser from 'body-parser'
import type { Server } from 'node:net'

declare global {
  namespace PXIOHTTP {
    /**
     * The object of an express.js response.
     */
    type Response = express.Response
    /**
     * The object of an express.js request.
     */
    interface Request<S = {}> extends express.Request {
      session: express.Request['session'] & Partial<S>
    }
    type ResponseError = {
      code?: string
      message: string
      stack?: string
    }
    type ErrorMiddleware = (error?: ResponseError, req?: Request, res?: PXIOHTTP.Response, next?: Next) => void
    type Middleware = (req?: PXIOHTTP.Request, res?: PXIOHTTP.Response, next?: Next) => void
    interface Middlewares<C = any> {
      before?: Array<keyof C | PXIOHTTP.Middleware>
      after?: Array<keyof C | PXIOHTTP.Middleware>
    }
    type EngineTemplates = {
      name: string
      dirViews: string
      ext: string
      callback: (path: string, options: object, callback: (e: any, rendered?: string) => void) => void
    }
    /**
     * List of public routes.
     */
    type PathPublic = {
      /**
       * Route.
       * @type {string}
       */
      route: string
      /**
       * Directory.
       * @type {string}
       */
      dir: string
    }
    /**
     * Options for development.
     */
    type Dev = {
      /**
       * Indicates whether the server will print the external IP (LAN) on the terminal.
       */
      showExternalIp: boolean
      /**
       * Name of the network interface.
       */
      interfaceNetwork: string
    }
    type Config = {
      createServer?: (app: express.Express) => Server
      middlewares?: any[]
      /**
       * Configuration for body parser.
       */
      optionsUrlencoded?: BodyParser.OptionsUrlencoded
      /**
       * Set up a templating engine.
       */
      engineTemplates?: EngineTemplates
      /**
       * Events of Gorila HTTP.
       */
      events?: {
        onError?: (error: Error, request: Request, response: Response, next: Next) => void
        /**
         * Called before the express.js instance is configured.
         */
        beforeConfig?: (app: express.Express) => void
        /**
         * Called after the express.js instance is configured.
         */
        afterConfig?: (app: express.Express) => void
        /**
         * Called after the server starts.
         */
        beforeStarting?: (app: express.Express) => void
      };
      pathsPublic?: PathPublic[]
      dev?: Dev
      /**
       * Port the server is listening on.
       * @type {number}
       */
      port?: number
    }
  }
  function Middlewares<C = any>(mws?: PXIOHTTP.Middlewares<C>): <T extends new (...args: any[]) => {}>(constructor: T) => void
  type Next = express.NextFunction
  interface VIEW {
    path: string
    view: string
  }
  type VIEWS = VIEW[]
  function View(path?: string, options?: object): (target: Object, propertyKey: string) => void
  function After<C = any>(middleware: Array<keyof C | PXIOHTTP.Middleware | PXIOHTTP.ErrorMiddleware>): (target: Object, propertyKey: string) => void
  function Before<C = any>(middleware: Array<keyof C | PXIOHTTP.Middleware | PXIOHTTP.ErrorMiddleware>): (target: Object, propertyKey: string) => void
  function Get(path?: string): (target: Object, propertyKey: string) => void
  function Post(path?: string): (target: Object, propertyKey: string) => void
  function Put(path?: string): (target: Object, propertyKey: string) => void
  function Delete(path?: string): (target: Object, propertyKey: string) => void
  function All(path?: string): (target: Object, propertyKey: string) => void
}

export { }