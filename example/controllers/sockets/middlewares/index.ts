export const verifySession: PXIOSockets.Middleware = ({ socket }: PXIOSockets.EventArgs) => {
  if (!socket.request.session) {
    console.error("No hay sesión!")
    return false
  }
}