const fs = require('node:fs')
const path = require('node:path')
const { buildSync } = require('esbuild')
const generate = require('./generate')

module.exports = ({ type, boot, resources = [], loader }, log) => {
  const { modules, plugins } = generate({ type, boot })
  for (const { name, input, inject, outfile, config, banner, external } of modules) {
    log(`Compilando: ${name}`)
    buildSync({
      entryPoints: [input],
      bundle: true,
      inject,
      outfile,
      target: 'node18',
      format: 'cjs',
      platform: 'node',
      sourcemap: true,
      color: true,
      banner: {
        js: `const isRelease = false;\n${config ? `const configs = require('./../config').configs` : banner ? banner : ''}`
      },
      external,
      absWorkingDir: process.env.PWD,
      loader,
      plugins
    })
  }
  const { PWD } = process.env
  for (const resource of resources) {
    fs.cpSync(path.join(PWD, resource), path.join(PWD, 'dist', resource), { recursive: true, force: true })
  }
  const package = require(process.env.npm_package_json)
  const packageName = package.name || 'pxio-server'
  const newPackage = {
    name: packageName,
    version: package.version || '1.0.0',
    description: package.description || '',
    main: 'server/main.js',
    bin: {
      [packageName]: 'server/main.js'
    },
    scripts: {
      start: `node . --type ${type}`
    },
    dependencies: package.dependencies || {},
    license: package.license || 'ISC'
  }
  fs.writeFileSync(path.join(PWD, 'dist', 'package.json'), JSON.stringify(newPackage, null, '\t'), 'utf-8')
  log('Compilado!')
}