function initHttpServer({ onMessage = console.log } = {}) {
  const routers = require('./modules/http').default
  const getConfig = require('./modules/configs').default
  const express = require('express')
  let app = express()
  const {
    port = (process.env.PORT ? parseInt(process.env.PORT) : 3001),
    dev,
    events = {},
    middlewares = [],
    pathsPublic,
    engineTemplates,
    optionsUrlencoded,
    createServer
  } = getConfig('HTTP') || {}
  app.set('port', port)
  let externalIp = null
  if (dev && dev.showExternalIp) {
    const interfaces = require("os").networkInterfaces()
    if (dev.interfaceNetwork) {
      const inter = interfaces[dev.interfaceNetwork]
      if (inter) {
        externalIp = inter.find(item => item.family == 'IPv4').address
      } else {
        console.error(`\nLa interfaz de red "${dev.interfaceNetwork}" no existe!.\nSe pueden usar las siguientes interfaces:\n${Object.keys(interfaces).join(', ')}`)
      }
    } else {
      console.error('\nNo se definió una interfaz de red.\nSe pueden usar las siguientes interfaces:\n' + Object.keys(interfaces).join(', '))
    }
  }
  if (events.beforeConfig) {
    events.beforeConfig(app)
  }
  if (optionsUrlencoded) {
    app.use(express.urlencoded(optionsUrlencoded))
  }
  for (const middleware of middlewares) {
    app.use(middleware)
  }
  if (pathsPublic) {
    pathsPublic.forEach(({ route, dir }) => app.use(route, express.static(dir)))
  }
  if (engineTemplates) {
    app.engine(engineTemplates.ext, engineTemplates.callback)
    app.set('views', engineTemplates.dirViews)
    app.set('view engine', engineTemplates.name)
  }
  if (events.afterConfig) {
    events.afterConfig(app)
  }
  app.use(express.json())
  app.use(express.text())
  for (const router of routers) {
    app.use(...router)
  }
  if (events.onError) {
    app.use(events.onError)
  }
  let server
  if (createServer) {
    server = createServer(app)
  }
  if (!server) {
    const http = require('http')
    server = http.createServer(app)
  }
  const listen = server.listen(port, () => {
    onMessage(`Servidor corriendo en: http://localhost:${port}${externalIp ? ` y http://${externalIp}:${port}` : ''}`)
  })
  if (events.beforeStarting) {
    events.beforeStarting(app)
  }
  process.on('SIGTERM', () => {
    onMessage('SIGTERM signal received: closing HTTP server')
    listen.close(() => {
      onMessage('HTTP server closed')
    })
  })
  return { http: server, app }
}

export { initHttpServer }