declare global {
  const BOOT: string
  const IS_HTTP: boolean
  const IS_SOCKETS: boolean
  const IS_HTTP_SOCKETS: boolean
  const IS_RELEASE: boolean
  function Namespace(namespace: string): <T extends new (...args: any[]) => {}>(constructor: T) => void
  type ConfigModule = typeof import("config")
  function getConfig<K extends keyof ConfigModule>(name: K): ConfigModule[K]
  type CallbackEmitter<T = undefined> = (args: T) => void | Promise<void>
  class Emitter {
    on<T = undefined>(callback: CallbackEmitter<T>): string
    off(uuid: string): void
    emit<T = {}>(args?: T | undefined): void
  }
  class Emitters {
    static createEmitter(): Emitter
    on<T = undefined>(event: string, callback: CallbackEmitter<T>): string
    off(event: string, uuid: string): void
    emit<T = undefined>(event: string, args?: T | undefined): void
  }
  const moduleEmitters: Emitters
  type LibrariesModule = typeof import("libraries")
  function Library(nameLibrary: keyof LibrariesModule): (target: Object, propertyKey: string) => void
  function Model(nameLibrary: keyof ModelsModule): (target: Object, propertyKey: string) => void
  type ModelsModule = typeof import('models')
  type Models<T extends keyof ModelsModule> = InstanceType<ModelsModule[T]>
  function getFlag(name: string): string | boolean
}

export { }