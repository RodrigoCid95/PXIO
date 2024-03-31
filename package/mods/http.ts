import express from 'express'

interface Middlewares {
  before?: any[]
  after?: any[]
}

interface Route {
  methods: string[]
  path: string
  method: any
  middlewares?: Middlewares
}

interface Routes {
  [x: string]: Route
}

const httpControllersPath = './httpControllers.js'
const httpControllers = require(httpControllersPath)
const routers: any[] = []
const controllersName = Object.keys(httpControllers)
for (const controllerName of controllersName) {
  const Controller = httpControllers[controllerName]
  if (Controller.prototype) {
    let namespace = undefined
    if (Controller.$namespace) {
      namespace = Controller.$namespace
      delete Controller.$namespace
    }
    let beforeMiddlewares: any[] = []
    if (Controller.$beforeMiddlewares) {
      beforeMiddlewares = Controller.$beforeMiddlewares
    }
    let afterMiddlewares: any[] = []
    if (Controller.$afterMiddlewares) {
      afterMiddlewares = Controller.$afterMiddlewares
    }
    let $routes: Routes = {}
    if (Controller.prototype.$routes) {
      $routes = Controller.prototype.$routes
      delete Controller.prototype.$routes
    }
    const controller = new Controller()
    const router = express.Router()
    const routeKeys = Object.keys($routes)
    for (const key of routeKeys) {
      let { methods, path, method, middlewares = { before: [], after: [] } } = $routes[key]
      let { before = [], after = [] } = middlewares
      before = [...beforeMiddlewares, ...before].map(mid => (typeof mid === 'string' ? controller[mid] : mid).bind(controller))
      after = [...after, ...afterMiddlewares].map(mid => (typeof mid === 'string' ? controller[mid] : mid).bind(controller))
      const mids = [...before, method.bind(controller), ...after]
      for (const m of methods) {
        router[m || 'all'](path, ...mids)
      }
    }
    const r: any[] = [router]
    if (namespace) {
      r.unshift(namespace[0] === '/' ? namespace : `/${namespace}`)
    }
    routers.push(r)
  }
}

export default routers