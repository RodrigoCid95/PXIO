declare const IS_HTTP: boolean
declare const IS_SOCKETS: boolean
declare const IS_RELEASE: boolean

let log = (message: string) => console.log(message)
!IS_RELEASE && (log = (message: string) => process.send(message))
let http: any = undefined
IS_HTTP && (http = initHttpServer({ onMessage: log }).http)
IS_SOCKETS && initSocketsServer({ http, onError: log })