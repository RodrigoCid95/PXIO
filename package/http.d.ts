import * as express from 'express'
import BodyParser from 'body-parser'

declare enum Methods {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  ALL = ''
}

declare function viewDecorator(path: string, options?: object): (target: Object, propertyKey: string) => void

declare function onDecorator(method: Methods, path: string): (target: Object, propertyKey: string) => void
declare function onDecorator(methods: Methods[], path: string): (target: Object, propertyKey: string) => void

declare function afterMiddlewareDecorator(middleware: Array<string | PXIOHTTP.Middleware | PXIOHTTP.ErrorMiddleware>): (target: Object, propertyKey: string) => void
declare function beforeMiddlewareDecorator(middleware: Array<string | PXIOHTTP.Middleware | PXIOHTTP.ErrorMiddleware>): (target: Object, propertyKey: string) => void

declare global {
  namespace PXIOHTTP {
    type EngineTemplates = {
      name: string;
      dirViews: string;
      ext: string;
      callback: (path: string, options: object, callback: (e: any, rendered?: string) => void) => void;
    }
    type Next = express.NextFunction;
    /**
     * List of public routes.
     */
    type PathPublic = {
      /**
       * Route.
       * @type {string}
       */
      route: string;
      /**
       * Directory.
       * @type {string}
       */
      dir: string;
    }
    /**
     * Options for development.
     */
    type Dev = {
      /**
       * Indicates whether the server will print the external IP (LAN) on the terminal.
       */
      showExternalIp: boolean;
      /**
       * Name of the network interface.
       */
      interfaceNetwork: string;
    }
    type Config = {
      middlewares?: any[]
      /**
       * Configuration for body parser.
       */
      optionsUrlencoded?: BodyParser.OptionsUrlencoded;
      /**
       * Set up a templating engine.
       */
      engineTemplates?: EngineTemplates;
      /**
       * Events of Gorila HTTP.
       */
      events?: {
        onError?: (error: Error, request: Request, response: Response, next: Next) => void
        /**
         * Called before the express.js instance is configured.
         */
        beforeConfig?: (app: express.Express) => void;
        /**
         * Called after the express.js instance is configured.
         */
        afterConfig?: (app: express.Express) => void;
        /**
         * Called after the server starts.
         */
        beforeStarting?: (app: express.Express) => void;
      };
      pathsPublic?: PathPublic[];
      dev?: Dev;
      /**
       * Port the server is listening on.
       * @type {number}
       */
      port?: number;
    }
    type METHODS = typeof Methods
    type OnDecorator = typeof onDecorator
    type ViewDecorator = typeof viewDecorator
    type ResponseError = {
      code?: string
      message: string
      stack?: string
    }
    type ErrorMiddleware = (error?: ResponseError, req?: Request, res?: Response, next?: Next) => void
    type Middleware = (req?: Request, res?: Response, next?: Next) => void
    type AfterMiddlewareDecorator = typeof afterMiddlewareDecorator
    type BeforeMiddlewareDecorator = typeof beforeMiddlewareDecorator
    /**
     * The object of an express.js response.
     */
    type Response = express.Response;
    /**
     * The object of an express.js request.
     */
    interface Request<S = {}> extends express.Request {
      session: express.Request['session'] & Partial<S>
    }
    interface VIEW {
      path: string
      view: string
      middlewares: Middleware[]
    }
    type VIEWS = VIEW[]
  }
}

export { }