const fs = require('node:fs')

module.exports = () => {
  const package = require(process.env.npm_package_json)
  const { pxio = {} } = package
  const {
    type = 'http',
    boot = 'auto',
    resources = [],
    loader = {}
  } = pxio
  const config = { type, boot, resources, loader }
  if (!Object.prototype.hasOwnProperty.call(package, 'pxio')) {
    package.pxio = config
    fs.writeFileSync(process.env.npm_package_json, JSON.stringify(package, null, '\t'))
  }
  return config
}