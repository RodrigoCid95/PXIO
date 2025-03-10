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

class Pipeline {
  #stack: any[] = []

  use = (...middlewares: any[]) => this.#stack = this.#stack.concat(middlewares)

  async run(...args: any[]) {
    const stack = [...this.#stack]
    let result = undefined
    while (stack.length !== 0) {
      const layer = stack.shift()
      result = await layer(...args)
      if (result !== undefined) {
        break
      }
    }
    return result
  }
}

const values = Object.values<any>(workersControllers)
for (const Controller of values) {
  if (Controller.prototype && Controller.prototype.$routes) {
    let $namespace: string = Controller.name || 'global'
    if (Controller.$namespace) {
      $namespace = Controller.$namespace.join('.')
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
    const controller = new Controller()
    for (const { nameEvent, propertyKey, middlewares = { before: [], after: [] } } of routes) {
      const routeName = `${$namespace}:${nameEvent}`
      const callback = controller[propertyKey].bind(controller)
      const pipeline = new Pipeline()
      pipeline.use(...beforeMiddlewares)
      pipeline.use(...middlewares.before)
      pipeline.use(callback)
      pipeline.use(...middlewares.after)
      pipeline.use(...afterMiddlewares)
      workersEmitter.on(routeName, async (id: Message['id'], data: Message['data']) => {
        const response = await pipeline.run({ eventName: routeName, data })
        !SINGLE_PROCESS && responseEmitter.emit('emit', id, response)
        SINGLE_PROCESS && responseEmitter.emit(id, response)
      })
    }
  }
}

!SINGLE_PROCESS && process.on('message', async ({ id, nameEvent, data }: Message) => {
  const eventNames = workersEmitter.eventNames()
  if (eventNames.includes(nameEvent)) {
    workersEmitter.emit(nameEvent, id, data)
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
  data: any
}