import express from 'express'
import * as httpControllers from 'http'
import getModel from './models'

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

const routers: any[] = []
const controllersName = Object.keys(httpControllers)
for (const controllerName of controllersName) {
  const Controller = httpControllers[controllerName]
  if (Controller.prototype) {
    let namespace: string[] | undefined = undefined
    if (Controller.$namespace) {
      namespace = Controller.$namespace
      delete Controller.$namespace
    }
    let beforeMiddlewares: any[] = []
    if (Controller.prototype.$beforeMiddlewares) {
      beforeMiddlewares = Controller.prototype.$beforeMiddlewares
      delete Controller.prototype.$beforeMiddlewares
    }
    let afterMiddlewares: any[] = []
    if (Controller.prototype.$afterMiddlewares) {
      afterMiddlewares = Controller.prototype.$afterMiddlewares
      delete Controller.prototype.$afterMiddlewares
    }
    let $routes: Routes = {}
    if (Controller.prototype.$routes) {
      $routes = Controller.prototype.$routes
      delete Controller.prototype.$routes
    }
    if (Controller.prototype.$models) {
      for (const [propertyKey, name] of Object.entries<string>(Controller.prototype.$models)) {
        Object.defineProperty(Controller.prototype, propertyKey, { value: getModel(name), writable: false })
      }
      delete Controller.prototype.$models
    }
    const controller = new Controller()
    const router = express.Router()
    for (const [path, route] of Object.entries($routes)) {
      for (const [method, { callback, middlewares }] of Object.entries(route)) {
        let { before = [], after = [] } = middlewares
        before = [...beforeMiddlewares, ...before].map(mid => (typeof mid === 'string' ? controller[mid] : mid).bind(controller))
        after = [...after, ...afterMiddlewares].map(mid => (typeof mid === 'string' ? controller[mid] : mid).bind(controller))
        const mids = [...before, callback.bind(controller), ...after]
        router[method](path, ...mids)
      }
    }
    const r: any[] = [router]
    if (namespace) {
      r.unshift(`/${namespace.join('/')}`)
    }
    routers.push(r)
  }
}

export default routers