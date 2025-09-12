export const verifySession: PXIOHTTP.Middleware = (req: PXIOHTTP.Request<Chat.SessionData>, res: PXIOHTTP.Response, next: Next): void => {
  if (req.session.user) {
    next()
  } else {
    res.redirect('/login')
  }
}

export const verifyNotSession: PXIOHTTP.Middleware = (req: PXIOHTTP.Request<Chat.SessionData>, res: PXIOHTTP.Response, next: Next): void => {
  if (!req.session.user) {
    next()
  } else {
    res.redirect('/')
  }
}
