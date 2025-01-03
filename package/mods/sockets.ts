import type { Server } from 'socket.io'
import * as socketsControllers from 'sockets'
import getModel from './models'

const loadNamespaces = (io: Server) => {
  const indices: string[] = Object.keys(socketsControllers)
  const namespaces: any = []
  for (const controllerName of indices) {
    const Controller = socketsControllers[controllerName]
    if (Controller.prototype) {
      let $namespace: string | undefined = undefined
      if (Controller.$namespace) {
        $namespace = `/${Controller.$namespace.join('/')}`
        delete Controller.$namespace
      }
      const namespace: any = {
        value: $namespace === undefined ? io : io.of($namespace),
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
        for (const [propertyKey, name] of Object.entries<string>($models)) {
          Object.defineProperty(Controller.prototype, propertyKey, { value: getModel(name), writable: false })
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