const fs = require('node:fs')
const path = require('node:path')
const { prompt } = require('inquirer').default

function getFlag(name) {
  const argList = process.argv
  const args = {}
  let a
  let opt
  let thisOpt
  let curOpt
  for (a = 0; a < argList.length; a++) {
    thisOpt = argList[a].trim()
    opt = thisOpt.replace(/^\-+/, '')
    if (opt === thisOpt) {
      if (curOpt) args[curOpt] = opt
      curOpt = null
    } else {
      curOpt = opt
      args[curOpt] = true
    }
  }
  return args[name]
}

module.exports = async (isDebugging = false) => {
  if (!fs.existsSync(process.env.npm_package_json)) {
    const { execSync } = require('node:child_process')
    execSync('npm init -y', [], { encoding: 'utf-8', cwd: process.cwd() })
  }
  const package = require(process.env.npm_package_json)
  const { pxio = {} } = package
  let {
    omitAuto,
    boot = '',
    resources = [],
    loader = {},
    type = []
  } = pxio
  let writeConfig = false
  if (type.length === 0) {
    let ask = false
    const typeFlag = getFlag('type') || getFlag('t')
    if (typeFlag && typeof typeFlag === 'string') {
      const typeFiltered = typeFlag.split(',').filter(s => ['http', 'sockets', 'workers'].includes(s))
      if (typeFiltered.length === 0) {
        ask = true
      } else {
        type = typeFiltered
      }
    } else {
      ask = true
    }
    if (ask) {
      const { typeProyect } = await prompt([
        {
          type: 'checkbox',
          name: 'typeProyect',
          message: 'Selecciona que tipo de servidor quieres usar:',
          choices: [
            { name: 'HTTP', value: 'http' },
            { name: 'Sockets', value: 'sockets' },
            { name: 'Workers', value: 'workers' },
          ],
          validate: (answer) => {
            if (answer.length < 1) {
              return 'Debes seleccionar al menos una opción.'
            }
            return true
          },
        },
      ])
      type = typeProyect
    }
    writeConfig = true
  }
  if (!boot) {
    let ask = false
    const bootFlag = getFlag('boot') || getFlag('b')
    if (bootFlag && typeof bootFlag === 'string') {
      if (['manual', 'auto'].includes(bootFlag)) {
        boot = bootFlag
      } else {
        ask = true
      }
    } else {
      ask = true
    }
    if (ask) {
      const { bootProyect } = await prompt([
        {
          type: 'list',
          name: 'bootProyect',
          message: 'Selecciona un modo de arranque:',
          choices: [
            { name: 'Automático', value: 'auto' },
            { name: 'Manual', value: 'manual' }
          ],
        },
      ])
      boot = bootProyect
    }
    writeConfig = true
  }
  if (omitAuto === undefined) {
    const omitAutoFlag = getFlag('omit-auto') || getFlag('oa')
    if (typeof omitAuto === 'boolean') {
      omitAuto = omitAutoFlag
    } else {
      const { omitAutoProyect } = await prompt([
        {
          type: 'list',
          name: 'omitAutoProyect',
          message: 'Omitir la automatización del Framework:',
          choices: [
            { name: 'No', value: false },
            { name: 'Sí', value: true }
          ],
        },
      ])
      omitAuto = omitAutoProyect
    }
    writeConfig = true
  }
  const config = { type, boot, resources, loader, type, omitAuto }
  if (writeConfig) {
    package.pxio = { ...config }
    fs.writeFileSync(process.env.npm_package_json, JSON.stringify(package, null, '\t'))
  }
  if (typeof pxio.outDir === 'string') {
    config['outDir'] = path.resolve(process.cwd(), pxio.outDir)
  } else {
    config['outDir'] = path.resolve(process.cwd(), isDebugging ? '.debugger' : 'dist')
  }
  return config
}