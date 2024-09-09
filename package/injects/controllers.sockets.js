function On(nameEvent) {
  return (target, propertyKey, descriptor) => {
    if (!target.hasOwnProperty('$routes')) {
      target.$routes = []
    }
    target.$routes.push({ nameEvent, propertyKey })
    return descriptor
  }
}

export { On }