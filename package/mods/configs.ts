import * as configModule from './modules/config'

class Configs {
  #profiles = {}
  constructor() {
    for (const [name, config] of Object.entries(configModule)) {
      Object.defineProperty(this.#profiles, name as string, { value: config, writable: false })
    }
  }
  get = (name: string) => this.#profiles[name]
}
export const configs = new Configs()