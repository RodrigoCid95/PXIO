import type { sqlite3 } from 'sqlite3'
import { verbose } from 'sqlite3'
import usersQuery from './users.sql'

export const database = () => {
  const { path }: Database.Config = getConfig('database')
  const sqlite3: sqlite3 = verbose()
  const connector = new sqlite3.Database(path)
  connector.run(usersQuery)
  return connector
}