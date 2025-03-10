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

function Model(model) {
  return (target, propertyKey) => {
    if (!Object.prototype.hasOwnProperty.call(target, '$models')) {
      target.$models = {}
    }
    target.$models[propertyKey] = model
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
  Namespace
}