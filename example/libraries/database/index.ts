import sqlite3 from 'sqlite3'
import usersQuery from './users.sql'

export class Database extends sqlite3.Database {
  constructor() {
    const { path }: Database.Config = getConfig('database')
    super(path)
    this.run(usersQuery)
  }
}