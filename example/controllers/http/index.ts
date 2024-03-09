declare const On: PXIO.Controllers.HTTP.OnDecorator
declare const METHODS: PXIO.Controllers.HTTP.METHODS
const { GET } = METHODS

export class IndexController {
  @On(GET, '/')
  public index(req: PXIO.Controllers.HTTP.Request, res: PXIO.Controllers.HTTP.Response): void {
    res.status(200).send('Hola, mundo!')
  }
}