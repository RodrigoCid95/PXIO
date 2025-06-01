import type { Server } from 'socket.io'
import * as socketsControllers from 'sockets'
import getModel from './models'

class Pipeline {
  #stack: any[] = []

  use = (...middlewares: any[]) => this.#stack = this.#stack.concat(middlewares)

  async run(args: any) {
    const stack = [...this.#stack]
    let result = undefined
    while (stack.length !== 0) {
      const layer = stack.shift()
      result = await layer(args)
      if (result !== undefined) {
        break
      }
    }
    return result
  }
}

const loadNamespaces = (io: Server) => {
  const indices: string[] = Object.keys(socketsControllers)
  const namespaces: any = []
  for (const controllerName of indices) {
    const Controller = socketsControllers[controllerName]
    if (Controller.prototype) {
      const namespace: any = {
        value: io,
        onConnectCallbacks: undefined,
        routes: [],
        onDisconnectCallbacks: undefined
      }
      if (Controller.$namespace) {
        namespace.value = io.of(`/${Controller.$namespace.join('/')}`)
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
      let routes = []
      if (Controller.prototype.$routes) {
        routes = Controller.prototype.$routes
        delete Controller.prototype.$routes
      }
      if (Controller.prototype.$models) {
        for (const [propertyKey, name] of Object.entries<string>(Controller.prototype.$models)) {
          Object.defineProperty(Controller.prototype, propertyKey, { value: getModel(name), writable: false })
        }
        delete Controller.prototype.$models
      }
      const controller = new Controller(namespace.value, io)
      for (const { nameEvent, propertyKey, middlewares = { before: [], after: [] } } of routes) {
        const callback = controller[propertyKey].bind(controller)
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
        const pipeline = new Pipeline()
        pipeline.use(...beforeMiddlewares)
        pipeline.use(...middlewares.before)
        pipeline.use(callback)
        pipeline.use(...middlewares.after)
        pipeline.use(...afterMiddlewares)
        if (nameEvent === 'connect') {
          namespace.onConnectCallbacks = pipeline
        } else if (nameEvent === 'disconnect') {
          namespace.onDisconnectCallbacks = pipeline
        } else {
          namespace.routes.push({ nameEvent, pipeline })
        }
      }
      namespaces.push(namespace)
    }
  }
  return namespaces
}
export default loadNamespaces