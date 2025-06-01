function Middlewares(mws = {}) {
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

function getModels(ctor) {
  if (!Object.hasOwn(ctor, '$models')) {
    const parent = Object.getPrototypeOf(ctor)
    const inherited = parent?.$models || {}
    ctor.$models = { ...inherited }
  }
  return ctor.$models
}

function clearModels(ctor) {
  while (ctor && ctor !== Function.prototype) {
    if (Object.hasOwn(ctor, '$models')) {
      delete ctor.$models
    }
    ctor = Object.getPrototypeOf(ctor)
  }
}

function Model(value) {
  return function (target, key) {
    const ctor = target.constructor
    const models = getModels(ctor)
    models[key] = value
  }
}

function Namespace(...namespace) {
  return function (constructor) {
    constructor.$namespace = namespace
    return constructor
  }
}

export {
  Middlewares,
  Model,
  Namespace,
  getModels,
  clearModels
}