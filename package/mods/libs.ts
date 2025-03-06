import * as libsModule from 'libs'

const instances = {}
const keys: any[] = []
const values = Object
  .entries<any>(libsModule)
  .filter(([_, lib]) => typeof lib === 'function')
  .map(([key, lib]) => {
    keys.push(key)
    return lib.prototype ? new lib() : lib()
  })
Promise
  .all(values)
  .then(libs => {
    for (let i = 0; i < keys.length; i++) {
      Object.defineProperty(instances, keys[i], { value: libs[i], writable: false })
    }
  })
  .catch(err => {
    console.error(err)
  })

export default (name: string) => instances[name]