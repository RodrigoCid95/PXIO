import type { Database } from 'sqlite3'

export class MiModelo {
  @Library('Database') private database: Database
  public createUser(newUser: User.New): void {
    this.database.run(`INSERT INTO "users" (uuid, user_name, full_name, hash_password) VALUES (?, ?, ?, ?)`, Object.values(newUser))
  }
  public findUserByUserName(user_name: string): Promise<User.Result | undefined> {
    return new Promise(resolve => this.database.get<User.Result>('SELECT * FROM "users" WHERE user_name = ?', [user_name], (error, result) => resolve(error ? undefined : result)))
  }
}
