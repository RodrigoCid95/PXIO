export function Namespace(namespace) {
  return function (constructor) {
    constructor.$namespace = namespace
    return constructor
  }
}
export function On(nameEvent) {
  return (target, propertyKey, descriptor) => {
    if (!target.hasOwnProperty('$routes')) {
      target.$routes = []
    }
    target.$routes.push({ nameEvent, propertyKey })
    return descriptor
  }
}