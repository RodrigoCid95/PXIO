import EventEmitter from 'node:events'
import * as workersControllers from 'workers'
import getModel from './models'

const workersEmitter = new EventEmitter()
const responseEmitter = new EventEmitter()

responseEmitter.on('emit', (id: string, data?: any) => {
  if (process.send) {
    process.send({ id, data })
  }
})

const values = Object.values<any>(workersControllers)
for (const Controller of values) {
  if (Controller.prototype && Controller.prototype.$routes) {
    let $namespace: string | undefined = undefined
    if (Controller.$namespace) {
      $namespace = Controller.$namespace.join('.')
      delete Controller.$namespace
    }
    const { $routes } = Controller.prototype
    delete Controller.prototype.$routes
    if (Object.prototype.hasOwnProperty.call(Controller.prototype, '$models')) {
      for (const [propertyKey, name] of Object.entries<string>(Controller.prototype.$models)) {
        Object.defineProperty(Controller.prototype, propertyKey, { value: getModel(name), writable: false })
      }
      delete Controller.prototype.$models
    }
    const controller = new Controller()
    for (const { nameEvent, propertyKey } of $routes) {
      const path: string[] = []
      if ($namespace) {
        path.push($namespace)
      }
      path.push(nameEvent)
      const routeName = path.join(':')
      workersEmitter.on(routeName, async (id: Message['id'], args: Message['args']) => {
        const data = await controller[propertyKey].bind(controller)(...args)
        responseEmitter.emit('emit', id, data)
      })
    }
  }
}

process.on('message', async ({ id, nameEvent, args }: Message) => {
  const eventNames = workersEmitter.eventNames()
  if (eventNames.includes(nameEvent)) {
    workersEmitter.emit(nameEvent, id, args)
  }
})

process.stdin.resume()

interface Message {
  id: string
  nameEvent: string
  args: any[]
}