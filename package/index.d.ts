declare type CallbackEmitter<T = undefined> = (args: T) => void | Promise<void>

declare function libraryDecorator(nameLibrary: keyof LibrariesModule): (target: Object, propertyKey: string) => void
declare function modelDecorator(nameLibrary: keyof ModelsModule): (target: Object, propertyKey: string) => void
declare function prefixDecorator(prefix: string): <T extends new (...args: any[]) => {}>(constructor: T) => void

declare global {
  type ModelsModule = typeof import('models')
  type Models<T extends keyof ModelsModule> = InstanceType<ModelsModule[T]>
  type ConfigModule = typeof import("config")
  type LibrariesModule = typeof import("libraries")
  namespace PXIO {
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
    class Flags {
      get(name: string): string | number | boolean
    }
    class Configs {
      get<K extends keyof ConfigModule>(name: K): ConfigModule[K]
    }
    class Libraries {
      get<K extends keyof LibrariesModule>(name: K): LibrariesModule[K]
      get<T = {}>(name: keyof LibrariesModule): T
    }
    type LibraryDecorator = typeof libraryDecorator
    type ModelDecorator = typeof modelDecorator
    type PrefixDecorator = typeof prefixDecorator
  }
}

export { }