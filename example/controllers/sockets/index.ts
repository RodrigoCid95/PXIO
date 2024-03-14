declare const Model: PXIO.ModelDecorator
declare const On: PXIOSockets.OnDecorator

export class IndexController {
  @Model('MiModelo') model: Models<'MiModelo'>
  @On('index')
  public index() {
    return this.model.message
  }
}