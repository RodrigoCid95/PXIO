import * as modelsModule from './modules/models'

declare const libraries: any

class Models {
  #instances = {}
  constructor() {
    for (const [name, Model] of Object.entries(modelsModule) as any[]) {
      if (Model.prototype) {
        if (Object.prototype.hasOwnProperty.call(Model.prototype, '$libraries')) {
          for (const [propertyKey, lib] of Object.entries(Model.prototype.$libraries)) {
            Object.defineProperty(Model.prototype, propertyKey, { value: libraries.get(lib), writable: false })
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