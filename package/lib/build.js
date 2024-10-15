const fs = require('node:fs')
const path = require('node:path')
const { buildSync } = require('esbuild')
const generate = require('./generate')

module.exports = ({ type, boot, resources = [], loader, outDir, omitAuto }, log) => {
  const { PWD = process.cwd() } = process.env
  const { modules, plugins } = generate({ type, boot, isRelease: true, outDir, omitAuto })
  for (const { name, input, inject, outfile, external, alias, define } of modules) {
    log(`Compilando: ${name}`)
    buildSync({
      alias,
      entryPoints: [input],
      bundle: true,
      inject,
      outfile,
      target: 'node22',
      format: 'cjs',
      platform: 'node',
      sourcemap: true,
      color: true,
      external,
      absWorkingDir: PWD,
      loader,
      plugins,
      treeShaking: true,
      define
    })
  }
  for (const resource of resources) {
    fs.cpSync(path.join(PWD, resource), path.join(outDir, resource), { recursive: true, force: true })
  }
  if (!omitAuto) {
    const package = require(process.env.npm_package_json)
    const packageName = package.name || 'pxio-server'
    const main = 'main.js'
    const bin = {
      [packageName]: 'main.js'
    }
    const version = package.version || '1.0.0'
    const description = package.description || ''
    const scripts = {
      start: `node .`
    }
    const license = package.license || 'ISC'
    const newPackage = {
      ...package,
      name: packageName,
      main,
      bin,
      version,
      description,
      scripts,
      license
    }
    if (newPackage.devDependencies) {
      delete newPackage.devDependencies
    }
    if (newPackage.pxio) {
      delete newPackage.pxio
    }
    fs.writeFileSync(path.join(outDir, 'package.json'), JSON.stringify(newPackage, null, '\t'), 'utf-8')
  }
  log('Compilado!')
}
