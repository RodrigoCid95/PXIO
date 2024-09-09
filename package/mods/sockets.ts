import type { Server } from 'socket.io'
import * as socketsControllers from './modules/sockets'

declare const models: any

const loadNamespaces = (io: Server) => {
  const indices: string[] = Object.keys(socketsControllers)
  const namespaces: any = []
  for (const controllerName of indices) {
    const Controller = socketsControllers[controllerName]
    if (Controller.prototype) {
      let $namespace: string = '/'
      if (Controller.$namespace) {
        $namespace = Controller.$namespace[0] === '/' ? Controller.$namespace : `/${Controller.$namespace}`
        delete Controller.$namespace
      }
      const namespace: any = {
        value: $namespace === '/' ? io : io.of($namespace),
        onConnectCallbacks: [],
        routes: [],
        onDisconnectCallbacks: []
      }
      let routes = []
      if (Controller.prototype.$routes) {
        routes = Controller.prototype.$routes
        delete Controller.prototype.$routes
      }
      if (Object.prototype.hasOwnProperty.call(Controller.prototype, '$models')) {
        const { $models } = Controller.prototype
        for (const [propertyKey, name] of Object.entries($models)) {
          Object.defineProperty(Controller.prototype, propertyKey, { value: models.get(name), writable: false })
        }
        delete Controller.prototype.$models
      }
      const controller = new Controller(namespace.value)
      for (const { nameEvent, propertyKey } of routes) {
        if (nameEvent === 'connect') {
          namespace.onConnectCallbacks.push(controller[propertyKey].bind(controller))
        } else if (nameEvent === 'disconnect') {
          namespace.onDisconnectCallbacks.push(controller[propertyKey].bind(controller))
        } else {
          namespace.routes.push({
            nameEvent,
            callback: controller[propertyKey].bind(controller)
          })
        }
      }
      namespaces.push(namespace)
    }
  }
  return namespaces
}
export default loadNamespaces