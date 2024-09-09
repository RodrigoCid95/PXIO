import * as configModule from './modules/config'

class Configs {
  #profiles = {}
  constructor() {
    const indices: any[] = configModule.default ? Object.entries(configModule.default) : Object.entries(configModule)
    for (const [name, config] of indices) {
      Object.defineProperty(this.#profiles, name as string, { value: config, writable: false })
    }
  }
  get = (name: string) => this.#profiles[name]
}
export const configs = new Configs()