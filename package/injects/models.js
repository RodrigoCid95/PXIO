function getLibraries(ctor) {
  if (!Object.hasOwn(ctor, '$libraries')) {
    const parent = Object.getPrototypeOf(ctor)
    const inherited = parent?.$libraries || {}
    ctor.$libraries = { ...inherited }
  }
  return ctor.$libraries
}

function clearLibraries(ctor) {
  while (ctor && ctor !== Function.prototype) {
    if (Object.hasOwn(ctor, '$libraries')) {
      delete ctor.$libraries
    }
    ctor = Object.getPrototypeOf(ctor)
  }
}

function Library(value) {
  return function(target, key) {
    const ctor = target.constructor
    const libraries = getLibraries(ctor)
    libraries[key] = value
  }
}

export {
  Library,
  getLibraries,
  clearLibraries
}