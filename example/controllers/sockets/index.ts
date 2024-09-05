@Namespace('chat')
export class IndexController {
  @Model('MiModelo') model: Models<'MiModelo'>
  constructor(private io: IO) { }
  @On('connect')
  public join(socket: Socket): void {
    const { user_name, full_name } = (socket.handshake as any).session.user
    socket.broadcast.emit('join', { user_name, full_name })
  }
  @On('message')
  public message(message: string, socket: Socket): void {
    const { user_name } = (socket.handshake as any).session.user
    this.io.emit('message', { user_name, message })
  }
  @On('disconnect')
  public leave(_: string, socket: Socket): void {
    const { user_name, full_name } = (socket.handshake as any).session.user
    socket.broadcast.emit('leave', { user_name, full_name })
  }
}