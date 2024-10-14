const path = require('node:path')
const { fork } = require('node:child_process')
const { context } = require('esbuild')
const generate = require('./generate')

module.exports = async ({ type, boot, loader }, log, args) => {
  const { PWD = process.cwd() } = process.env
  let isRunning = false
  let childProcess = null
  const initServer = () => {
    log('Iniciando servidor...')
    childProcess = fork(path.join(PWD, '.debugger', 'main.js'), ['--type', type, ...args])
    childProcess.on('message', log)
    childProcess.on('error', log)
  }
  const { modules, plugins } = generate(
    { type, boot, isRelease: false },
    result => {
      if (isRunning) {
        if (!childProcess?.killed) {
          childProcess.kill()
          log('Servidor detenido!')
        }
        if (result.errors.length === 0) {
          initServer()
        }
      }
    }
  )
  const builders = await Promise.all(modules.map(({ input, inject, outfile, external, alias, define }) => context({
    alias,
    entryPoints: [input],
    bundle: true,
    inject,
    outfile,
    target: 'node18',
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
  })))
  await Promise.all(builders.map(builder => builder.watch()))
  initServer()
  isRunning = true
  log('Listo!')
}