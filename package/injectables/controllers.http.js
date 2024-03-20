export function Namespace(namespace, mws = {}) {
  return function (constructor) {
    constructor.$namespace = namespace
    if (mws.before) {
      constructor.$beforeMiddlewares = mws.before
    }
    if (mws.after) {
      constructor.$afterMiddlewares = mws.after
    }
    return constructor
  }
}
const registerRoute = (target, propertyKey, descriptor) => {
  if (!target.hasOwnProperty('$routes')) {
    target.$routes = {}
  }
  if (!target.$routes.hasOwnProperty(propertyKey)) {
    target.$routes[propertyKey] = {
      methods: [],
      path: '',
      method: descriptor?.value,
      middlewares: {
        after: [],
        before: []
      }
    }
  } else {
    target.$routes[propertyKey].method = descriptor?.value
  }
}
export function AfterMiddleware(mws) {
  return (target, propertyKey, descriptor) => {
    registerRoute(target, propertyKey, descriptor)
    for (let mw of mws) {
      if (typeof mw === 'string') {
        if (!target.hasOwnProperty(mw)) {
          console.error(`\n${target.name}: El middleware ${mw} no está declarado!`)
          return descriptor
        }
        mw = target[mw]
      }
      target.$routes[propertyKey].middlewares.after.push(mw)
    }
    if (descriptor) {
      return descriptor
    }
  }
}
export function BeforeMiddleware(mws) {
  return (target, propertyKey, descriptor) => {
    registerRoute(target, propertyKey, descriptor)
    for (let mw of mws) {
      if (typeof mw === 'string') {
        if (!target.hasOwnProperty(mw)) {
          console.error(`\n${target.name}: El middleware ${mw} no está declarado!`)
          if (descriptor) {
            return descriptor
          }
        }
        mw = target[mw]
      }
      target.$routes[propertyKey].middlewares.before.push(mw)
    }
    if (descriptor) {
      return descriptor
    }
  }
}
export function On(methods, path) {
  return (target, propertyKey, descriptor) => {
    registerRoute(target, propertyKey, descriptor)
    target.$routes[propertyKey].methods = Array.isArray(methods) ? methods : [methods]
    target.$routes[propertyKey].path = path
    return descriptor
  }
}
export function View(path, args = {}) {
  return (target, propertyKey) => {
    let value = undefined
    On('get', path)(target, propertyKey, {
      value: ({ body, params, query, session }, res) => {
        res.render(value, { body, params, query, session, ...args })
      }
    })
    return {
      set(val) {
        if (value === undefined) {
          value = val
        }
      },
      get() {
        return value
      }
    }
  }
}
export const METHODS = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
  ALL: ''
}