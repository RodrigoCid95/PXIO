import { verifySession, verifyNotSession } from './middlewares'
import { v4, v5 } from 'uuid'

declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const METHODS: PXIOHTTP.METHODS
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
const { GET, POST } = METHODS

export class IndexController {
  @Model('MiModelo') private model: Models<'MiModelo'>
  @On(GET, '/')
  @BeforeMiddleware([verifySession])
  public index(req: PXIOHTTP.Request<Chat.SessionData>, res: PXIOHTTP.Response): void {
    const { user } = req.session
    res.render('index', { title: 'Chat', user })
  }
  @On(GET, '/login')
  @BeforeMiddleware([verifyNotSession])
  public login(_: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    res.render('login', { title: 'Iniciar sesión' })
  }
  @On(POST, '/login')
  @BeforeMiddleware([verifyNotSession])
  public async logIn(req: PXIOHTTP.Request<Chat.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { user_name, password } = req.body
    const result = await this.model.findUserByUserName(user_name)
    if (result) {
      const { uuid } = result
      const hash = v5(password, uuid)
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
  @On(GET, '/register')
  @BeforeMiddleware([verifyNotSession])
  public register(_: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    res.render('register', { title: 'Registrarse' })
  }
  @On(POST, '/register')
  @BeforeMiddleware([verifyNotSession])
  public newUser(req: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    const { user_name, full_name, password } = req.body
    const uuid = v4()
    const hash_password = v5(password, uuid)
    this.model.createUser({
      uuid,
      user_name,
      full_name,
      hash_password
    })
    res.status(200).json(true)
  }
  @On(GET, '/logout')
  public logout(req: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    req.session.destroy(() => res.redirect('/login'))
  }
}