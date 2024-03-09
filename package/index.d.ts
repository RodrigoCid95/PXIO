type CallbackEmitter<T = undefined> = (args: T) => void | Promise<void>

declare function libraryDecorator(nameLibrary: keyof PXIO.LibrariesModule): (target: Object, propertyKey: string) => void
declare function modelDecorator(nameLibrary: keyof PXIO.ModelsModule): (target: Object, propertyKey: string) => void
declare function prefixDecorator(prefix: string): <T extends new (...args: any[]) => {}>(constructor: T) => void

declare global {
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
    type ConfigModule = typeof import("config")
    class Configs {
      get<K extends keyof ConfigModule>(name: K): ConfigModule[K]
    }
    type LibrariesModule = typeof import("libraries")
    class Libraries {
      get<K extends keyof LibrariesModule>(name: K): LibrariesModule[K]
      get<T = {}>(name: keyof LibrariesModule): T
    }
    type LibraryDecorator = typeof libraryDecorator
    type ModelsModule = typeof import('models')
    type ModelDecorator = typeof modelDecorator
    type PrefixDecorator = typeof prefixDecorator
  }
}