import * as http from 'http'

type OptionsSocketsServer = {
  http?: http.Server
  onError?: (error: any) => void
}

function initHttpServer(options: { onMessage?: (message: string) => void; }): void
function initHttpServer(options: { returnInstance?: boolean; onMessage?: (message: string) => void; }): http.Server

function initSocketsServer(options: OptionsSocketsServer): void

declare global {
  namespace PXIOServer {
    type InitHttpServer = typeof initHttpServer
    type InitSocketsServer = typeof initSocketsServer
  }
}