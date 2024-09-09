import * as configModule from './modules/config'

class Configs {
  #profiles = {}
  constructor() {
    let indices: any[] = Object.entries(configModule)
    if (Object.prototype.hasOwnProperty.call(configModule, 'default')) {
      indices = Object.entries(configModule.default)
    }
    for (const [name, config] of indices) {
      Object.defineProperty(this.#profiles, name as string, { value: config, writable: false })
    }
  }
  get = (name: string) => this.#profiles[name]
}
export const configs = new Configs()