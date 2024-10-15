@Namespace('api', 'users')
export class IndexController {
  @Model('MiModelo') private model: Models<'MiModelo'>

  @On('findByUserName')
  public async getUsers(user_name: string) {
    const result = await this.model.findUserByUserName(user_name)
    return result
  }
}