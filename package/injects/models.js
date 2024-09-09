function Library(lib) {
  return (target, propertyKey) => {
    if (!Object.prototype.hasOwnProperty.call(target, '$libraries')) {
      target.$libraries = {}
    }
    target.$libraries[propertyKey] = lib
  }
}

export { Library }