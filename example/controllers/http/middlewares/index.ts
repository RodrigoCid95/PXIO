export const verifySession = (req: PXIOHTTP.Request<Chat.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next) => {
  if (req.session.user) {
    next()
  } else {
    res.redirect('/login')
  }
}
export const verifyNotSession = (req: PXIOHTTP.Request<Chat.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next) => {
  if (!req.session.user) {
    next()
  } else {
    res.redirect('/')
  }
}