import * as libsModule from './modules/libs'

class Libraries {
  #instances = {}
  constructor() {
    const indices = Object.keys(libsModule)
    for (const indice of indices) {
      const libResult = libsModule[indice]()
      if (libResult instanceof Promise) {
        libResult
          .then(lib => Object.defineProperty(this.#instances, indice, { value: lib, writable: false }))
          .catch(error => console.error(error))
      } else {
        Object.defineProperty(this.#instances, indice, { value: libResult, writable: false })
      }
    }
  }
  get = (name: string) => this.#instances[name]
}
export const libraries = new Libraries()