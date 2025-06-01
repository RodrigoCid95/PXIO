import * as modelsModule from 'models'
import getLib from './libs'

declare const getLibraries: any
declare const clearLibraries: any

const instances = {}
const keys = Object.keys(modelsModule)
const values = Object
  .values<any>(modelsModule)
  .map(Model => {
    if (Model.prototype) {
      const libraries = getLibraries(Model)
      const eLibraries = Object.entries<string>(libraries)
      if (eLibraries.length > 0) {
        for (const [propertyKey, name] of eLibraries) {
          Object.defineProperty(Model.prototype, propertyKey, { value: getLib(name), writable: false })
        }
      }
      clearLibraries(Model)
      return new Model()
    }
    return null
  })
for (let i = 0; i < keys.length; i++) {
  Object.defineProperty(instances, keys[i], { value: values[i], writable: false })
}
export default (name: string) => instances[name]