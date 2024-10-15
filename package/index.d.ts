declare global {
  const BOOT: string
  const IS_HTTP: boolean
  const IS_SOCKETS: boolean
  const IS_HTTP_SOCKETS: boolean
  const IS_RELEASE: boolean
  function Namespace(...namespace: string[]): <T extends new (...args: any[]) => {}>(constructor: T) => void
  type ConfigModule = typeof import("config")
  function getConfig<K extends keyof ConfigModule>(name: K): ConfigModule[K]
  type CallbackEmitter<T = undefined> = (args: T) => void | Promise<void>
  type LibrariesModule = typeof import("libraries")
  function Library(nameLibrary: keyof LibrariesModule): (target: Object, propertyKey: string) => void
  function Model(nameLibrary: keyof ModelsModule): (target: Object, propertyKey: string) => void
  type ModelsModule = typeof import('models')
  type Models<T extends keyof ModelsModule> = InstanceType<ModelsModule[T]>
  function getFlag(name: string): string | boolean
}

export { }