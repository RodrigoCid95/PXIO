function initSocketsServer({ http, onError = console.error } = {}) {
  const getLib = require('./modules/libs').default
  const SocketIO = require('socket.io')
  const getConfig = require('./modules/configs').default
  let io = null
  const pxioSocketsConfig = getConfig('WS') || {}
  const {
    port = process.env.PORT ? parseInt(process.env.PORT) : 80,
    events = {}
  } = pxioSocketsConfig
  if (http) {
    io = new SocketIO.Server(http, pxioSocketsConfig)
  } else {
    io = SocketIO(port, pxioSocketsConfig)
  }
  const loadRouters = require('./modules/sockets').default
  const namespaces = loadRouters(io)
  for (const { value: namespace, onConnectCallbacks, routes, onDisconnectCallbacks } of namespaces) {
    if (events.onBeforeConfig) {
      events.onBeforeConfig(namespace)
    }
    namespace.on("connection", async (socket) => {
      if (events.onConnect) {
        await events.onConnect({ socket, io })
      }
      for (const onConnectCallback of onConnectCallbacks) {
        onConnectCallback(socket)
      }
      for (const { nameEvent, callback } of routes) {
        socket.on(nameEvent, async (...args) => {
          let reply = null
          if (typeof args[args.length - 1] === 'function') {
            reply = args.pop()
          }
          try {
            if (events.onANewRequest) {
              args = await events.onANewRequest({ args, socket, getLibraryInstance: getLib })
            }
            args.push(socket)
            let response = { response: await callback(...args) }
            if (events.onBeforeToResponse && reply) {
              response = await events.onBeforeToResponse({ response, socket, getLibraryInstance: getLib })
            }
            if (reply) {
              reply(response)
            }
          } catch ({ message, stack }) {
            let error = { error: { message, stack } }
            if (events.onBeforeToResponse && reply) {
              error = await events.onBeforeToResponse({ error, socket, getLibraryInstance: getLib })
            }
            onError(message)
            onError(stack)
            if (reply) {
              reply(error)
            }
          }
        })
      }
      socket.on("disconnect", reason => {
        if (events.onDisconnect) {
          events.onDisconnect(reason, io, socket)
        }
        for (const onDisconnectCallback of onDisconnectCallbacks) {
          onDisconnectCallback(reason, socket, io)
        }
      })
    })
  }
  return io
}

export { initSocketsServer }