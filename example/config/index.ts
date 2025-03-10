import path from 'node:path'
import { Liquid } from 'liquidjs'
import session from 'express-session'
import sharedSession from 'express-socket.io-session'
import compression from 'compression'
import { v4 } from 'uuid'

const sessionMiddleware = session({
  saveUninitialized: false,
  resave: false,
  secret: v4()
})

export const HTTP: PXIOHTTP.Config = {
  optionsUrlencoded: { extended: true },
  engineTemplates: {
    name: 'liquid',
    ext: 'liquid',
    callback: (new Liquid({
      layouts: path.resolve(process.cwd(), 'views'),
      extname: 'liquid'
    })).express(),
    dirViews: path.resolve(process.cwd(), 'views')
  },
  middlewares: [
    compression(),
    sessionMiddleware
  ],
  events: {
    onError(err, req, res, next) {
      if (err) {
        res.status(500).json(err)
      } else {
        next()
      }
    }
  },
}

export const WS: PXIOSockets.Config = {
  serveClient: true,
  events: {
    onBeforeConfig(io) {
      io.engine.use(sessionMiddleware)
    }
  }
}

export const database: Database.Config = {
  path: path.resolve(process.cwd(), 'data.db')
}
