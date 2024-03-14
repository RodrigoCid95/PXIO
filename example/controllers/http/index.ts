declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const METHODS: PXIOHTTP.METHODS
const { GET } = METHODS

export class IndexController {
  @Model('MiModelo') model: Models<'MiModelo'>

  @On(GET, '/')
  public index(req: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    res.status(200).send(this.model.message)
  }
}