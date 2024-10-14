import * as configModule from 'config'

const profiles = {}
let indices: any[] = Object.entries(configModule)
for (const [name, config] of indices) {
  Object.defineProperty(profiles, name as string, { value: config, writable: false })
}

export default (name: string) => profiles[name]