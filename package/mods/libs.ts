import * as libsModule from 'libs'

const instances = {}
const keys = Object.keys(libsModule)
const values = Object
  .values<any>(libsModule)
  .map(lib => lib())
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