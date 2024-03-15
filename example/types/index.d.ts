import './database'
import './users'

declare global {
  namespace Chat {
    interface SessionData {
      user: User.Result
    }
  }
}

export { }