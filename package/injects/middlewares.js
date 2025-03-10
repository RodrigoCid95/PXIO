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
        if (typeof mw === 'string') {
          if (!target.hasOwnProperty(mw)) {
            console.error(`\n${target.name}: El middleware "${mw}" no está declarado`)
            continue
          }
          target.$routes[index].middlewares.before.push(target[mw])
        }
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
        if (typeof mw === 'string') {
          if (!target.hasOwnProperty(mw)) {
            console.error(`\n${target.name}: El middleware "${mw}" no está declarado`)
            continue
          }
          target.$routes[index].middlewares.after.push(target[mw])
        }
        target.$routes[index].middlewares.after.push(mw)
      }
    }
    return descriptor
  }
}

export { Before, After }