import * as http from 'http'
import * as core from "express-serve-static-core";
import * as SocketIO from 'socket.io'

declare type OptionsSocketsServer = {
  http?: http.Server
  onError?: (error: any) => void
}

declare type InitHttpServerResult = {
  http: http.Server
  app: core.Express
}
declare function initHttpServer(options: { onMessage?: (message: string) => void; }): InitHttpServerResult
declare function initSocketsServer(options: OptionsSocketsServer): SocketIO.Server

declare global {
  namespace PXIOServer {
    type InitHttpServer = typeof initHttpServer
    type InitSocketsServer = typeof initSocketsServer
  }
}

export { }