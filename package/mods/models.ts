import * as modelsModule from 'models'
import getLib from './libs'

const instances = {}
const keys = Object.keys(modelsModule)
const values = Object
  .values<any>(modelsModule)
  .map(Model => {
    if (Model.prototype) {
      if (Object.prototype.hasOwnProperty.call(Model.prototype, '$libraries')) {
        for (const [propertyKey, lib] of Object.entries<string>(Model.prototype.$libraries)) {
          Object.defineProperty(Model.prototype, propertyKey, {
            get() {
              return getLib(lib)
            }
          })
        }
        delete Model.prototype.$libraries
      }
      return new Model()
    }
    return null
  })
for (let i = 0; i < keys.length; i++) {
  Object.defineProperty(instances, keys[i], { value: values[i], writable: false })
}
export default (name: string) => instances[name]