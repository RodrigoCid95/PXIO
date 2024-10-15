const fs = require('node:fs')
const path = require('node:path')

module.exports = (isDebugging = false) => {
  const package = require(process.env.npm_package_json)
  const { pxio = {} } = package
  const {
    omitAuto = false,
    outDir = isDebugging ? '.debugger' : 'dist',
    boot = 'auto',
    resources = [],
    loader = {}
  } = pxio
  const type = pxio.type || []
  const controllersPath = path.join(process.cwd(), 'controllers')
  const indexHTTPControllers = path.join(controllersPath, 'http', 'index.ts')
  const HTTPControllers = path.join(controllersPath, 'http.ts')
  const indexSocketsControllers = path.join(controllersPath, 'sockets', 'index.ts')
  const socketsControllers = path.join(controllersPath, 'sockets.ts')
  const indexWorkersControllers = path.join(controllersPath, 'workers', 'index.ts')
  const workersControllers = path.join(controllersPath, 'workers.ts')
  const HTTPControllersExist = fs.existsSync(indexHTTPControllers) || fs.existsSync(HTTPControllers)
  const socketsControllersExist = fs.existsSync(indexSocketsControllers) || fs.existsSync(socketsControllers)
  const workersControllersExist = fs.existsSync(indexWorkersControllers) || fs.existsSync(workersControllers)
  if ((HTTPControllersExist || (!socketsControllersExist && !workersControllersExist)) && !type.includes('http')) {
    type.push('http')
  }
  if (socketsControllersExist && !type.includes('sockets')) {
    type.push('sockets')
  }
  if (workersControllersExist && !type.includes('workers')) {
    type.push('workers')
  }
  const config = { type, boot, resources, loader, outDir: path.resolve(process.cwd(), outDir), type, omitAuto }
  package.pxio = config
  package.pxio.outDir = outDir
  fs.writeFileSync(process.env.npm_package_json, JSON.stringify(package, null, '\t'))
  return config
}