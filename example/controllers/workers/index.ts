import { midd1, midd2, midd3, midd4 } from "./middlewares"

@Namespace('api', 'users')
@Middlewares({ before: [midd1], after: [midd4] })
export class IndexController {
  @Model('MiModelo') private model: Models<'MiModelo'>

  @Before([midd2])
  @After([midd3])
  @On('findByUserName')
  public async getUsers({ data: user_name }: PXIOWorkers.EventArgs) {
    const result = await this.model.findUserByUserName(user_name)
    return result
  }
}