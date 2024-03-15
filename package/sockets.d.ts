import * as SocketIO from 'socket.io'
import * as http from 'http'
import '.'

declare interface Req<S = any> extends http.IncomingMessage {
  session: S
}

declare function onDecorator(nameEvent: 'connect' | 'disconnect' | string): (target: Object, propertyKey: string) => void

declare global {
  namespace PXIOSockets {
    /**
     * Web socket.
     */
    interface Socket<S = any> extends SocketIO.Socket {
      readonly request: Req<S>
    }
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
          getLibraryInstance: PXIO.Libraries['get']
        }) => any | Promise<any>
        /**
         * Called when a call is made by the customer.
         */
        onANewRequest?: (args: {
          request: any[]
          socket: Socket
          getLibraryInstance: PXIO.Libraries['get']
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
    type OnDecorator = typeof onDecorator
    type IO = SocketIO.Server
  }
}

export { }