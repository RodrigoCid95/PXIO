const fs = require('node:fs')
const path = require('node:path')

module.exports = ({ type, boot, isRelease, outDir, omitAuto, singleProcess }, watch = undefined) => {
  const { PWD = process.cwd() } = process.env
  const injectables = path.resolve(__dirname, '..', 'injects')
  const mods = path.resolve(__dirname, '..', 'mods')
  const dist = path.join(outDir)
  const modules = [
    {
      name: 'Configurations module',
      input: path.join(mods, 'configs.ts'),
      inject: [
        path.join(injectables, 'flags.js')
      ],
      define: {
        IS_RELEASE: isRelease ? 'true' : 'false'
      },
      outfile: path.join(dist, 'modules', 'configs.js'),
      alias: { 'config': path.join(PWD, 'config') },
    },
    {
      name: 'Libraries module',
      input: path.join(mods, 'libs.ts'),
      inject: [
        path.join(injectables, 'flags.js'),
        path.join(injectables, 'configs.js')
      ],
      define: {
        IS_RELEASE: isRelease ? 'true' : 'false'
      },
      outfile: path.join(dist, 'modules', 'libs.js'),
      alias: { 'libs': path.join(PWD, 'libraries') },
      ext: ['./configs'],
    },
    {
      name: 'Models module',
      input: path.join(mods, 'models.ts'),
      inject: [
        path.join(injectables, 'flags.js'),
        path.join(injectables, 'configs.js'),
        path.join(injectables, 'models.js')
      ],
      define: {
        IS_RELEASE: isRelease ? 'true' : 'false'
      },
      outfile: path.join(dist, 'modules', 'models.js'),
      alias: { 'models': path.join(PWD, 'models') },
      ext: ['./libs'],
    }
  ]
  if (type.includes('http')) {
    modules.push({
      name: 'HTTP Controllers module',
      input: path.join(mods, 'http.ts'),
      inject: [
        path.join(injectables, 'flags.js'),
        path.join(injectables, 'controllers.js'),
        path.join(injectables, 'controllers.http.js')
      ],
      define: {
        IS_RELEASE: isRelease ? 'true' : 'false'
      },
      outfile: path.join(dist, 'modules', 'http.js'),
      alias: { 'http': path.join(PWD, 'controllers', 'http') },
      ext: ['./models'],
    })
  }
  if (type.includes('sockets')) {
    modules.push({
      name: 'Sockets Controllers module',
      input: path.join(mods, 'sockets.ts'),
      inject: [
        path.join(injectables, 'flags.js'),
        path.join(injectables, 'middlewares.js'),
        path.join(injectables, 'controllers.js'),
        path.join(injectables, 'controllers.sockets.js')
      ],
      define: {
        IS_RELEASE: isRelease ? 'true' : 'false'
      },
      outfile: path.join(dist, 'modules', 'sockets.js'),
      alias: { 'sockets': path.join(PWD, 'controllers', 'sockets') },
      ext: ['./models'],
    })
  }
  if (type.includes('workers')) {
    modules.push({
      name: 'Workers module',
      input: path.join(mods, 'workers.ts'),
      inject: [
        path.join(injectables, 'flags.js'),
        path.join(injectables, 'middlewares.js'),
        path.join(injectables, 'controllers.js'),
        path.join(injectables, 'controllers.workers.js')
      ],
      outfile: path.join(dist, 'modules', 'workers.js'),
      alias: { 'workers': path.join(PWD, 'controllers', 'workers') },
      ext: ['./models'],
      define: {
        SINGLE_PROCESS: singleProcess ? 'true' : 'false',
        IS_RELEASE: isRelease ? 'true' : 'false'
      },
    })
  }
  modules.push({
    name: 'Boot',
    input: boot === 'manual' ? path.join(PWD, 'main.ts') : path.join(mods, 'main.ts'),
    inject: [
      path.join(injectables, 'flags.js'),
      path.join(injectables, 'main.configs.js'),
      path.join(injectables, 'main.http.js'),
      path.join(injectables, 'main.sockets.js'),
      path.join(injectables, 'main.workers.js')
    ],
    define: {
      BOOT: `"${boot}"`,
      IS_HTTP: type.includes('http') ? 'true' : 'false',
      IS_SOCKETS: type.includes('sockets') ? 'true' : 'false',
      IS_WORKERS: type.includes('workers') ? 'true' : 'false',
      IS_HTTP_SOCKETS: type.includes('http') && type.includes('sockets') ? 'true' : 'false',
      IS_HTTP_SOCKETS_WORKERS: type.includes('http') && type.includes('sockets') && type.includes('workers') ? 'true' : 'false',
      IS_RELEASE: isRelease ? 'true' : 'false',
      OMIT_AUTO: omitAuto ? 'true' : 'false',
      SINGLE_PROCESS: singleProcess ? 'true' : 'false'
    },
    outfile: path.join(dist, 'main.js'),
    ext: ['./modules/*']
  })
  for (const { input } of modules) {
    if (!fs.existsSync(input)) {
      fs.mkdirSync(path.dirname(input), { recursive: true, force: true })
      fs.writeFileSync(input, '', 'utf-8')
    }
  }
  const { dependencies = { 'pxio': null }, devDependencies = { 'pxio': null } } = require(process.env.npm_package_json)
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