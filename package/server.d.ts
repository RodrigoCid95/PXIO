import type { Server } from 'node:net'
import type * as core from "express-serve-static-core"
import type * as SocketIO from 'socket.io'

declare type OptionsSocketsServer = {
  http?: Server
  onError?: (error: any) => void
}

declare type InitHttpServerResult = {
  http: Server
  app: core.Express
}

declare global {
  function initHttpServer(options?: { onMessage?: (message: string) => void; }): InitHttpServerResult
  function initSocketsServer(options?: OptionsSocketsServer): SocketIO.Server
  type EmitToWorker = <T = null>(nameEvent: string, args?: any[]) => Promise<T>
  function initWorkerServer(isGlobal?: boolean): EmitToWorker
  const emitToWorker: EmitToWorker
}

export { }