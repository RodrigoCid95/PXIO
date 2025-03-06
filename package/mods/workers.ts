import EventEmitter from 'node:events'
import * as workersControllers from 'workers'
import getModel from './models'

declare const SINGLE_PROCESS: boolean

const workersEmitter = new EventEmitter()
const responseEmitter = new EventEmitter()

!SINGLE_PROCESS && responseEmitter.on('emit', (id: string, data?: any) => {
  if (process.send) {
    process.send({ id, data })
  }
})

const values = Object.values<any>(workersControllers)
for (const Controller of values) {
  if (Controller.prototype && Controller.prototype.$routes) {
    let $namespace: string = Controller.name || 'global'
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
      const routeName = `${$namespace}:${nameEvent}`
      workersEmitter.on(routeName, async (id: Message['id'], args: Message['args']) => {
        const data = await controller[propertyKey].bind(controller)(...args)
        !SINGLE_PROCESS && responseEmitter.emit('emit', id, data)
        SINGLE_PROCESS && responseEmitter.emit(id, data)
      })
    }
  }
}

!SINGLE_PROCESS && process.on('message', async ({ id, nameEvent, args }: Message) => {
  const eventNames = workersEmitter.eventNames()
  if (eventNames.includes(nameEvent)) {
    workersEmitter.emit(nameEvent, id, args)
  } else {
    !SINGLE_PROCESS && responseEmitter.emit('emit', id, null)
    SINGLE_PROCESS && responseEmitter.emit(id, null)
  }
})

!SINGLE_PROCESS && process.stdin.resume()

SINGLE_PROCESS && (module.exports.workersEmitter = workersEmitter)
SINGLE_PROCESS && (module.exports.responseEmitter = responseEmitter)

interface Message {
  id: string
  nameEvent: string
  args: any[]
}