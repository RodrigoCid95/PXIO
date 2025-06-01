import express from 'express'
import * as httpControllers from 'http'
import getModel from './models'

declare const getModels: any
declare const clearModels: any

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
    if (Controller.$beforeMiddlewares) {
      beforeMiddlewares = Controller.$beforeMiddlewares
      delete Controller.$beforeMiddlewares
    }
    let afterMiddlewares: any[] = []
    if (Controller.$afterMiddlewares) {
      afterMiddlewares = Controller.$afterMiddlewares
      delete Controller.$afterMiddlewares
    }
    let $routes: Routes = {}
    if (Controller.prototype.$routes) {
      $routes = Controller.prototype.$routes
      delete Controller.prototype.$routes
    }
    const models = getModels(Controller)
    const eModels = Object.entries<string>(models)
    if (eModels.length > 0) {
      for (const [propertyKey, name] of eModels) {
        Object.defineProperty(Controller.prototype, propertyKey, { value: getModel(name), writable: false })
      }
    }
    clearModels(Controller)
    const controller = new Controller()
    const router = express.Router()
    for (const [path, route] of Object.entries($routes)) {
      for (let [method, { callback, middlewares }] of Object.entries(route)) {
        callback = callback.bind(controller)
        const bMiddlewares = [...beforeMiddlewares, ...middlewares.before]
        const aMiddlewares = [...afterMiddlewares, ...middlewares.after]
        const before: any[] = []
        const after: any[] = []
        for (const bm of bMiddlewares) {
          if (typeof bm === 'string') {
            if (!controller[bm]) {
              console.error(`El middleware ${bm} no está declarado dentro de ${Controller.name}`)
              continue
            }
            before.push(controller[bm].bind(controller))
          } else {
            before.push(bm.bind(controller))
          }
        }
        for (const am of aMiddlewares) {
          if (typeof am === 'string') {
            if (!controller[am]) {
              console.error(`El middleware ${am} no está declarado dentro de ${Controller.name}`)
              continue
            }
            after.push(controller[am].bind(controller))
          } else {
            after.push(am.bind(controller))
          }
        }
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