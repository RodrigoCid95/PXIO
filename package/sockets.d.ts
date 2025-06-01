import type * as SocketIO from 'socket.io'
import type * as http from 'http'
import '.'

declare interface Req<S = any> extends http.IncomingMessage {
  session: S
}


declare global {
  namespace PXIOSockets {
    interface Config extends Partial<SocketIO.ServerOptions> {
      /**
      * Port the server is listening on.
      * @type {number}
      */
      port?: number
      /**
       * Events.
       */
      events?: {
        onBeforeConfig?: (io: SocketIO.Server) => void
        /**
         * Called when a new connection is created.
         */
        onConnect?: (args: {
          socket: Socket
          io: SocketIO.Server
        }) => void | Promise<void>
        /**
         * Called before returning a response to the client.
         */
        onBeforeToResponse?: (args: {
          response: any
          socket: Socket
          getLibraryInstance: Libraries['get']
        }) => any | Promise<any>
        /**
         * Called when a call is made by the customer.
         */
        onANewRequest?: (args: {
          request: any[]
          socket: Socket
          getLibraryInstance: Libraries['get']
        }) => any[] | Promise<any[]>
        /**
         * Called when a client disconnects.
         */
        onDisconnect?: (args: {
          reason: string
          socket: Socket
          io: SocketIO.Server
        }) => void | Promise<void>
      }
    }
    type Middleware = <D = any>({ socket }: PXIOSockets.EventArgs<D>) => void
    interface Middlewares<C> {
      before?: PXIOSockets.Middleware[] | Array<keyof C> | string[]
      after?: PXIOSockets.Middleware[] | Array<keyof C> | string[]
    }
    interface EventArgs<T = any> {
      eventName: string
      data: T
      socket: Socket
    }
  }
  function Middlewares<C = any>(mws?: PXIOSockets.Middlewares<C>): <T extends new (...args: any[]) => {}>(constructor: T) => void
  function On(nameEvent: 'connect' | 'disconnect' | string): (target: Object, propertyKey: string) => void
  function After<C = any>(middleware: Array<string | PXIOSockets.Middleware | keyof C>): (target: Object, propertyKey: string) => void
  function Before<C = any>(middleware: Array<string | PXIOSockets.Middleware | keyof C>): (target: Object, propertyKey: string) => void
  /**
   * Web socket.
   */
  interface Socket<S = any> extends SocketIO.Socket {
    readonly request: Req<S>
  }
  type IO = SocketIO.Server
}

export { }