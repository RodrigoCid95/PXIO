declare const OMIT_AUTO: boolean
declare const IS_HTTP: boolean
declare const IS_SOCKETS: boolean
declare const IS_RELEASE: boolean
declare const IS_WORKERS: boolean

OMIT_AUTO && (IS_HTTP || IS_SOCKETS) && (module.exports.getConfig = getConfig)
OMIT_AUTO && IS_HTTP && (module.exports.initHttpServer = initHttpServer)
OMIT_AUTO && IS_SOCKETS && (module.exports.initSocketsServer = initSocketsServer)
OMIT_AUTO && IS_WORKERS && (module.exports.initWorkerServer = initWorkerServer)

!OMIT_AUTO && ((() => {
  IS_WORKERS && (initWorkerServer(true))
  let log = (message: string) => console.log(message)
  !IS_RELEASE && (log = (message: string) => process.send(message))
  let http: any = undefined
  IS_HTTP && (http = initHttpServer({ onMessage: log }).http)
  IS_SOCKETS && initSocketsServer({ http, onError: log })
})())