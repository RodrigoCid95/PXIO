function getRouteIndex(target, pk) {
  const index = target.$routes.findIndex(({ propertyKey }) => propertyKey === pk)
  if (index > -1) {
    if (!Object.prototype.hasOwnProperty.call(target.$routes[index], 'middlewares')) {
      target.$routes[index].middlewares = { before: [], after: [] }
    }
  }
  return index
}

function Before(mws = []) {
  return (target, propertyKey, descriptor) => {
    const index = getRouteIndex(target, propertyKey)
    if (index > -1) {
      for (const mw of mws) {
        target.$routes[index].middlewares.before.push(mw)
      }
    }
    return descriptor
  }
}

function After(mws = []) {
  return (target, propertyKey, descriptor) => {
    const index = getRouteIndex(target, propertyKey)
    if (index > -1) {
      for (const mw of mws) {
        target.$routes[index].middlewares.after.push(mw)
      }
    }
    return descriptor
  }
}

export { Before, After }