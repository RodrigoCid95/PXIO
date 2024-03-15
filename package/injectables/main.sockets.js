export const initSocketsServer = ({ http, onError = console.error } = {}) => {
  const configPath = './config.js'
  const { configs } = require(configPath)
  const libsPath = './libs.js'
  const { libraries } = require(libsPath)
  const socketsRoutersPath = './sockets.js'
  const SocketIO = require('socket.io')
  let io = null
  const pxioSocketsConfig = configs.get('WS') || {}
  const {
    port = process.env.PORT ? parseInt(process.env.PORT) : 80,
    events = {}
  } = pxioSocketsConfig
  if (http) {
    io = new SocketIO.Server(http, pxioSocketsConfig)
  } else {
    io = SocketIO(port, pxioSocketsConfig)
  }
  const loadRouters = require(socketsRoutersPath).default
  const routers = loadRouters(io)
  if (events.onBeforeConfig) {
    events.onBeforeConfig(io)
  }
  io.on('connect', async socket => {
    if (events.onConnect) {
      await events.onConnect({ socket, io })
    }
    if (Object.prototype.hasOwnProperty.call(routers, 'connectCallbacks')) {
      for (const callback of routers.connectCallbacks) {
        await callback(socket)
      }
    }
    if (Object.prototype.hasOwnProperty.call(routers, 'disconnectingCallbacks')) {
      for (const callback of routers.disconnectingCallbacks) {
        socket.on('disconnecting', reason => callback(reason, socket))
      }
    }
    for (const { nameEvent, callback } of routers) {
      if (nameEvent === 'disconnect') {
        socket.on('disconnect', reason => callback(reason, socket))
      } else if (nameEvent === 'connect') {
        callback(socket)
      } else {
        socket.on(nameEvent, async (...args) => {
          let reply = null
          if (typeof args[args.length - 1] === 'function') {
            reply = args.pop()
          }
          const { get } = libraries
          try {
            if (events.onANewRequest) {
              args = await events.onANewRequest({ args, socket, getLibraryInstance: get.bind(libraries) })
            }
            args.push(socket)
            args.push(io)
            let response = { response: await callback(...args) }
            if (events.onBeforeToResponse && reply) {
              response = await events.onBeforeToResponse({ response, socket, getLibraryInstance: get.bind(libraries) })
            }
            if (reply) {
              reply(response)
            }
          } catch ({ message, stack }) {
            let error = { error: { message, stack } }
            if (events.onBeforeToResponse && reply) {
              error = await events.onBeforeToResponse({ error, socket, getLibraryInstance: get.bind(libraries) })
            }
            onError(message)
            onError(stack)
            if (reply) {
              reply(error)
            }
          }
        })
      }
    }
    if (events.onDisconnect) {
      socket.on("disconnect", async reason => await events.onDisconnect(reason, io, socket))
    }
  })
  return io
}