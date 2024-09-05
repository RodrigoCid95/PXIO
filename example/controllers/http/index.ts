import { verifySession, verifyNotSession } from './middlewares'
import { v4, v5 } from 'uuid'

export class IndexController {
  @Model('MiModelo')
  private model: Models<'MiModelo'>

  @Before([verifySession])
  @View('/')
  public index: string = 'index'

  @Before([verifyNotSession])
  @View('/login', { title: 'Iniciar sesión' })
  public login: string = 'login'

  @Before([verifyNotSession])
  @View('/register', { title: 'Registrarse' })
  public register: string = 'register'
  
  @Before([verifyNotSession])
  @Post('/login')
  public async logIn(req: PXIOHTTP.Request<Chat.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { user_name, password } = req.body
    const result: User.Result | undefined = await this.model.findUserByUserName(user_name)
    if (result) {
      const { uuid } = result
      const hash: string = v5(password, uuid)
      if (result.hash_password === hash) {
        req.session.user = result
        res.status(200).json(true)
      } else {
        res.status(200).json(false)
      }
    } else {
      res.status(200).json(false)
    }
  }
  @Before([verifyNotSession])
  @Post('/register')
  public newUser(req: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    const { user_name, full_name, password } = req.body
    const uuid: string = v4()
    const hash_password: string = v5(password, uuid)
    this.model.createUser({
      uuid,
      user_name,
      full_name,
      hash_password
    })
    res.status(200).json(true)
  }
  @Get('/logout')
  public logout(req: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    req.session.destroy((): void => res.redirect('/login'))
  }
}