const type = flags.get('type')
const log = (message) => {
  if (!isRelease && process.send) {
    process.send(message)
  } else {
    console.log(message)
  }
}
let http: any = undefined
if (type.includes('http')) {
  http = initHttpServer({ onMessage: log }).http
}
if (type.includes('sockets')) {
  initSocketsServer({ http, onError: log })
}