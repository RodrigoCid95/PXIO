import type { Database } from 'sqlite3'

declare const Library: PXIO.LibraryDecorator

export class MiModelo {
  @Library('database') private database: Database
  public message: string = 'Hola, mundo!'
}