import * as libsModule from './modules/libs'

class Libraries {
  #instances = {}
  constructor() {
    let indices: any[] = Object.entries(libsModule)
    if (Object.prototype.hasOwnProperty.call(libsModule, 'default')) {
      indices = Object.entries(libsModule.default)
    }
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