function initSocketsServer({ http, onError = console.error } = {}) {
  const SocketIO = require('socket.io')
  const getConfig = require('./modules/configs').default
  let io = null
  const pxioSocketsConfig = getConfig('WS') || {}
  const {
    port = process.env.PORT ? parseInt(process.env.PORT) : 3002,
    events = {}
  } = pxioSocketsConfig
  if (http) {
    io = new SocketIO.Server(http, pxioSocketsConfig)
  } else {
    io = SocketIO(port, pxioSocketsConfig)
  }
  if (events.onBeforeConfig) {
    events.onBeforeConfig(io)
  }
  const loadRouters = require('./modules/sockets').default
  const namespaces = loadRouters(io)

  for (const { value: namespace, onConnectCallbacks, routes, onDisconnectCallbacks } of namespaces) {
    namespace.on("connection", async (socket) => {
      if (events.onConnect) {
        await events.onConnect({ socket, namespace, io })
      }
      if (onConnectCallbacks) {
        try {
          const result = await onConnectCallbacks.run({ data: null, socket, nameEvent: 'connect' })
          if (result === false) {
            return
          }
        } catch (error) {
          console.error(error)
          return
        }
      }
      for (const { nameEvent, pipeline } of routes) {
        socket.on(nameEvent, async (...args) => {
          let reply = null
          if (typeof args[args.length - 1] === 'function') {
            reply = args.pop()
          }
          let data = args.length > 1 ? args : args[0]
          try {
            if (events.onANewRequest) {
              data = await events.onANewRequest({ data, socket, nameEvent })
            }
            data = await pipeline.run({ data, socket, nameEvent })
            if (events.onBeforeToResponse && reply) {
              data = await events.onBeforeToResponse({ data, socket, nameEvent })
            }
            if (reply) {
              reply({ data })
            }
          } catch ({ message, stack }) {
            let error = { error: { message, stack } }
            if (events.onBeforeToResponse && reply) {
              error = await events.onBeforeToResponse({ error, socket, nameEvent })
            }
            onError(message)
            onError(stack)
            if (reply) {
              reply(error)
            }
          }
        })
      }
      socket.on("disconnect", async reason => {
        if (onDisconnectCallbacks) {
          await onDisconnectCallbacks.run({ data: reason, socket, nameEvent: 'disconnect' })
        }
        if (events.onDisconnect) {
          events.onDisconnect(reason, io, socket)
        }
      })
    })
  }
  return io
}

export { initSocketsServer }