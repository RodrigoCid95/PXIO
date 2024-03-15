declare const Model: PXIO.ModelDecorator
declare const On: PXIOSockets.OnDecorator

export class IndexController {
  @Model('MiModelo') model: Models<'MiModelo'>
  constructor(private io: PXIOSockets.IO) { }
  @On('connect')
  public join(socket: PXIOSockets.Socket) {
    const { user_name, full_name } = (socket.handshake as any).session.user
    socket.broadcast.emit('join', { user_name, full_name })
  }
  @On('message')
  public message(message: string, socket: PXIOSockets.Socket) {
    const { user_name } = (socket.handshake as any).session.user
    this.io.emit('message', { user_name, message })
  }
  @On('disconnect')
  public leave(_: string, socket: PXIOSockets.Socket) {
    const { user_name, full_name } = (socket.handshake as any).session.user
    socket.broadcast.emit('leave', { user_name, full_name })
  }
}