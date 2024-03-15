declare global {
  namespace User {
    interface New {
      uuid: string
      user_name: string
      full_name: string
      hash_password: string
    }
    type Result = Omit<New, 'hash'>
  }
}

export { }