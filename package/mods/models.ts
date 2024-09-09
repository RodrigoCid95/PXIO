import * as modelsModule from './modules/models'

declare const libraries: any

class Models {
  #instances = {}
  constructor() {
    let indices: any[] = Object.entries(modelsModule)
    if (Object.prototype.hasOwnProperty.call(modelsModule, 'default')) {
      indices = Object.entries(modelsModule.default)
    }
    for (const [name, Model] of indices) {
      if (Model.prototype) {
        if (Object.prototype.hasOwnProperty.call(Model.prototype, '$libraries')) {
          for (const [propertyKey, lib] of Object.entries(Model.prototype.$libraries)) {
            Object.defineProperty(Model.prototype, propertyKey, {
              get() {
                return libraries.get(lib)
              }
            })
          }
          delete Model.prototype.$libraries
        }
        Object.defineProperty(this.#instances, name, { value: new Model(), writable: false })
      }
    }
  }
  get = (name: string) => this.#instances[name]
}
export const models = new Models()