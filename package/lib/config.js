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
    boot,
    resources = [],
    loader = {},
    type = [],
    outDir,
    singleProcess
  } = pxio
  const typeFlag = getFlag('type') || getFlag('t')
  if (typeof typeFlag === 'string') {
    const typeFiltered = typeFlag.split(',').filter(s => ['http', 'sockets', 'workers'].includes(s))
    if (typeFiltered.length > 0) {
      type = typeFiltered
    }
  }
  if (type.length === 0) {
    const { typeProject } = await prompt([
      {
        type: 'checkbox',
        name: 'typeProject',
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
    type = typeProject
  }
  const bootFlag = getFlag('boot') || getFlag('b')
  if (typeof bootFlag === 'string') {
    if (['manual', 'auto'].includes(bootFlag)) {
      boot = bootFlag
    }
  }
  if (!boot) {
    const { bootProject } = await prompt([
      {
        type: 'list',
        name: 'bootProject',
        message: 'Selecciona un modo de inicio:',
        choices: [
          { name: 'Automático', value: 'auto' },
          { name: 'Manual', value: 'manual' }
        ],
      },
    ])
    boot = bootProject
  }
  const omitAutoFlag = getFlag('omit-auto') || getFlag('oa')
  if (typeof omitAutoFlag === 'boolean') {
    omitAuto = omitAutoFlag
  }
  if (omitAuto === undefined) {
    const { omitAutoProject } = await prompt([
      {
        type: 'list',
        name: 'omitAutoProject',
        message: 'Omitir la automatización del Framework:',
        choices: [
          { name: 'No', value: false },
          { name: 'Sí', value: true }
        ],
      },
    ])
    omitAuto = omitAutoProject
  }
  const singleProcessFlag = getFlag('single-process') || getFlag('sp')
  if (typeof singleProcessFlag === 'boolean') {
    singleProcess = singleProcessFlag
  }
  const outDirFlag = getFlag('out-dir') || getFlag('od')
  if (typeof outDirFlag === 'string') {
    outDir = path.resolve(process.cwd(), outDirFlag)
  }
  if (outDir === undefined) {
    outDir = path.resolve(process.cwd(), isDebugging ? '.debugger' : 'dist')
  } else {
    outDir = path.resolve(process.cwd(), outDir)
  }
  const config = { type, boot, resources, loader, type, omitAuto, outDir, singleProcess }
  return config
}