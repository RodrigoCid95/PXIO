import * as libsModule from './modules/libs'

class Libraries {
  #instances = {}
  constructor() {
    const indices: any[] = libsModule.default ? Object.entries(libsModule.default) : Object.entries(libsModule)
    for (const [name, lib] of indices) {
      const libResult = lib()
      if (libResult instanceof Promise) {
        libResult
          .then(lib => Object.defineProperty(this.#instances, name, { value: lib, writable: false }))
          .catch(error => console.error(error))
      } else {
        Object.defineProperty(this.#instances, name, { value: libResult, writable: false })
      }
    }
  }
  get = (name: string) => this.#instances[name]
}
export const libraries = new Libraries()