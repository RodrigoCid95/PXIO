import express from 'express'

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
    const { $routes = [] } = Controller.prototype
    const controller = new Controller()
    delete Controller.prototype.$routes
    const router = express.Router()
    const routeKeys = Object.keys($routes)
    for (const key of routeKeys) {
      let { methods, path, method, middlewares = {} } = $routes[key]
      let { before = [], after = [] } = middlewares
      before = before.map(mid => (typeof mid === 'string' ? controller[mid] : mid).bind(controller))
      after = after.map(mid => (typeof mid === 'string' ? controller[mid] : mid).bind(controller))
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