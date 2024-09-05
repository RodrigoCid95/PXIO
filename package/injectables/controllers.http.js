export function Middlewares(mws = {}) {
  return function (constructor) {
    if (mws.before) {
      constructor.$beforeMiddlewares = mws.before
    }
    if (mws.after) {
      constructor.$afterMiddlewares = mws.after
    }
    return constructor
  }
}
const registerRoute = ({
  path,
  method,
  target,
  propertyKey,
  descriptor
}) => {
  if (!target.hasOwnProperty('$routes')) {
    target.$routes = {}
  }
  if (!target.$routes.hasOwnProperty(path)) {
    target.$routes[path] = {}
  }
  target.$routes[path][method] = {
    propertyKey,
    callback: descriptor?.value,
    middlewares: {
      after: [],
      before: []
    }
  }
}
const findRoute = (target, propertyKey) => {
  for (const [path, route] of Object.entries(target.$routes)) {
    for (const [method, value] of Object.entries(route)) {
      if (propertyKey === value.propertyKey) {
        return { path, method }
      }
    }
  }
}
export function After(mws) {
  return (target, propertyKey, descriptor) => {
    const route = findRoute(target, propertyKey)
    if (route) {
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
        const { path, method } = findRoute(target, propertyKey)
        target.$routes[path][method].middlewares.after.push(mw)
      }
      if (descriptor) {
        return descriptor
      }
    } else {
      console.error(`No existe un path definido para el método ${propertyKey} de la clase ${target.constructor.name}.\nIntenta definir primero sus middlewares y después el path con los decoradores @All, @Get, @Post, @Put o @Delete.`)
    }
  }
}
export function Before(mws) {
  return (target, propertyKey, descriptor) => {
    const route = findRoute(target, propertyKey)
    if (route) {
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
        const { path, method } = findRoute(target, propertyKey)
        target.$routes[path][method].middlewares.before.push(mw)
      }
      if (descriptor) {
        return descriptor
      }
    } else {
      console.error(`No existe un path definido para el método ${propertyKey} de la clase ${target.constructor.name}.\nIntenta definir primero sus middlewares y después el path con los decoradores @All, @Get, @Post, @Put o @Delete.`)
    }
  }
}
export function Get(path) {
  return (target, propertyKey, descriptor) => {
    registerRoute({
      path,
      method: 'get',
      target,
      propertyKey,
      descriptor
    })
    return descriptor
  }
}
export function Post(path) {
  return (target, propertyKey, descriptor) => {
    registerRoute({
      path,
      method: 'post',
      target,
      propertyKey,
      descriptor
    })
    return descriptor
  }
}
export function Put(path) {
  return (target, propertyKey, descriptor) => {
    registerRoute({
      path,
      method: 'put',
      target,
      propertyKey,
      descriptor
    })
    return descriptor
  }
}
export function Delete(path) {
  return (target, propertyKey, descriptor) => {
    registerRoute({
      path,
      method: 'delete',
      target,
      propertyKey,
      descriptor
    })
    return descriptor
  }
}
export function All(path) {
  return (target, propertyKey, descriptor) => {
    registerRoute({
      path,
      method: 'all',
      target,
      propertyKey,
      descriptor
    })
    return descriptor
  }
}
export function View(path, args = {}) {
  return (target, propertyKey) => {
    let value = undefined
    Get(path)(target, propertyKey, {
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