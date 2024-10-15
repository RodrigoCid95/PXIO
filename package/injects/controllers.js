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

export { Model, Namespace }