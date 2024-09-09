const fs = require('node:fs')
const path = require('node:path')

module.exports = ({ type, boot }, watch = undefined) => {
  const { PWD } = process.env
  const injectables = path.resolve(__dirname, '..', 'injects')
  const mods = path.resolve(__dirname, '..', 'mods')
  const distPath = []
  if (watch) {
    distPath.push('.debugger')
  } else {
    distPath.push('dist')
    distPath.push('server')
  }
  const dist = path.join(PWD, ...distPath)
  const modules = [
    {
      name: 'Config module',
      input: path.join(PWD, 'config', 'index.ts'),
      inject: [
        path.join(injectables, 'flags.js'),
        path.join(injectables, 'emitters.js')
      ],
      outfile: path.join(dist, 'lib', 'modules', 'config.js')
    },
    {
      name: 'Library module',
      input: path.join(PWD, 'libraries', 'index.ts'),
      inject: [
        path.join(injectables, 'flags.js')
      ],
      config: true,
      outfile: path.join(dist, 'lib', 'modules', 'libs.js')
    },
    {
      name: 'Models module',
      input: path.join(PWD, 'models', 'index.ts'),
      inject: [
        path.join(injectables, 'flags.js'),
        path.join(injectables, 'models.js')
      ],
      config: true,
      outfile: path.join(dist, 'lib', 'modules', 'models.js')
    }
  ]
  const isDual = type.split('-').length > 1
  if (type.includes('http')) {
    modules.push({
      name: 'HTTP Controllers module',
      input: isDual ? path.join(PWD, 'controllers', 'http', 'index.ts') : path.join(PWD, 'controllers', 'index.ts'),
      inject: [
        path.join(injectables, 'flags.js'),
        path.join(injectables, 'controllers.js'),
        path.join(injectables, 'controllers.http.js')
      ],
      config: true,
      outfile: path.join(dist, 'lib', 'modules', 'http.js')
    })
  }
  if (type.includes('sockets')) {
    modules.push({
      name: 'Sockets Controllers module',
      input: isDual ? path.join(PWD, 'controllers', 'sockets', 'index.ts') : path.join(PWD, 'controllers', 'index.ts'),
      inject: [
        path.join(injectables, 'flags.js'),
        path.join(injectables, 'controllers.js'),
        path.join(injectables, 'controllers.sockets.js')
      ],
      config: true,
      outfile: path.join(dist, 'lib', 'modules', 'sockets.js')
    })
  }
  modules.push({
    name: 'Configurations',
    input: path.join(mods, 'configs.ts'),
    outfile: path.join(dist, 'lib', 'config.js'),
    ext: ['./modules/*']
  })
  modules.push({
    name: 'Libraries',
    input: path.join(mods, 'libs.ts'),
    outfile: path.join(dist, 'lib', 'libs.js'),
    ext: ['./modules/*']
  })
  modules.push({
    name: 'Models',
    input: path.join(mods, 'models.ts'),
    outfile: path.join(dist, 'lib', 'models.js'),
    ext: ['./modules/*'],
    banner: `const { libraries } = require('./libs.js');`
  })
  if (type.includes('http')) {
    modules.push({
      name: 'HTTP',
      input: path.join(mods, 'http.ts'),
      outfile: path.join(dist, 'lib', 'http.js'),
      ext: ['./modules/*'],
      banner: `const { models } = require('./models.js');`
    })
  }
  if (type.includes('sockets')) {
    modules.push({
      name: 'Sockets',
      input: path.join(mods, 'sockets.ts'),
      outfile: path.join(dist, 'lib', 'sockets.js'),
      ext: ['./modules/*'],
      banner: `const { models } = require('./models.js');`
    })
  }
  if (type.includes('sockets')) {
  }
  const inject = [path.join(injectables, 'flags.js')]
  if (type.includes('http')) {
    inject.push(path.join(injectables, 'main.http.js'))
  }
  if (type.includes('sockets')) {
    inject.push(path.join(injectables, 'main.sockets.js'))
  }
  modules.push({
    name: 'Boot',
    input: boot === 'manual' ? path.join(PWD, 'main.ts') : path.join(mods, 'main.ts'),
    inject,
    banner: `const configs = require('./lib/config').configs;`,
    outfile: path.join(dist, 'main.js'),
    ext: ['./lib/*']
  })
  for (const { input } of modules) {
    if (!fs.existsSync(input)) {
      fs.mkdirSync(path.dirname(input), { recursive: true, force: true })
      fs.writeFileSync(input, '', 'utf-8')
    }
  }
  const { dependencies = { 'px.io': null }, devDependencies = { 'px.io': null } } = require(process.env.npm_package_json)
  const externalDeps = [...Object.keys(dependencies), ...Object.keys(devDependencies)]
  let plugins = []
  let pluginsPath = path.join(PWD, 'plugins.js')
  if (!fs.existsSync(pluginsPath)) {
    pluginsPath = path.join(PWD, 'plugins', 'index.js')
  }
  if (fs.existsSync(pluginsPath)) {
    const pluginsModule = require(pluginsPath)
    if (Array.isArray(pluginsModule)) {
      plugins = pluginsModule
    }
  }
  if (watch) {
    plugins.push({
      name: 'watching',
      setup(build) {
        build.onEnd(watch)
      }
    })
  }
  return {
    modules: modules.map(mod => {
      const external = [...externalDeps, ...(mod.ext || [])]
      mod.external = external
      if (mod.ext) {
        delete mod.ext
      }
      return mod
    }),
    plugins
  }
}