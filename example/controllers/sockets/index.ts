import { verifySession } from "./middlewares"

@Namespace('chat')
@Middlewares({ before: [verifySession] })
export class IndexController {
  @Model('MiModelo') model: Models<'MiModelo'>

  constructor(private namespace: IO) { }

  @On('connect')
  public join({ socket }: PXIOSockets.EventArgs): void {
    const { user_name, full_name } = socket.request.session.user
    socket.broadcast.emit('join', { user_name, full_name })
  }

  @On('message')
  public message({ data: message, socket }: PXIOSockets.EventArgs<string>): void {
    const { user_name } = socket.request.session.user
    this.namespace.emit('message', { user_name, message })
  }

  @On('disconnect')
  public leave({ socket }: PXIOSockets.EventArgs): void {
    const { user_name, full_name } = socket.request.session.user
    socket.broadcast.emit('leave', { user_name, full_name })
  }
}