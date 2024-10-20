const fs = require('node:fs')
const path = require('node:path')
const { prompt } = require('inquirer').default

const install = async (name, dev = false) => {
  const { execSync } = require('node:child_process')
  const result = execSync(`npm i ${name}${dev ? ' -D' : ''}`, { encoding: 'utf-8', cwd: process.env.PDW })
  console.log(result)
}
module.exports = async ({ type, boot }, log) => {
  const CWD = process.env.PWD || process.cwd()
  const configModulePath = path.join(CWD, 'config', 'index.ts')
  if (!fs.existsSync(configModulePath)) {
    const configModuleDir = path.dirname(configModulePath)
    fs.mkdirSync(configModuleDir, { recursive: true, force: true })
    fs.writeFileSync(configModulePath, '')
  }
  const librsModulePath = path.join(CWD, 'libraries', 'index.ts')
  if (!fs.existsSync(librsModulePath)) {
    const librsModuleDir = path.dirname(librsModulePath)
    fs.mkdirSync(librsModuleDir, { recursive: true, force: true })
    fs.writeFileSync(librsModulePath, '')
  }
  const modelsModulePath = path.join(CWD, 'models', 'index.ts')
  if (!fs.existsSync(modelsModulePath)) {
    const modelsModuleDir = path.dirname(modelsModulePath)
    fs.mkdirSync(modelsModuleDir, { recursive: true, force: true })
    fs.writeFileSync(modelsModulePath, '')
  }
  const isMultiController = type.length > 1
  if (type.includes('http')) {
    let httpControllerPath = [CWD, 'controllers', 'http']
    if (isMultiController) {
      httpControllerPath.push('index.ts')
    } else {
      httpControllerPath[2] += '.ts'
    }
    httpControllerPath = path.join(...httpControllerPath)
    const httpControllerDir = path.dirname(httpControllerPath)
    if (!fs.existsSync(httpControllerDir)) {
      fs.mkdirSync(httpControllerDir, { recursive: true, force: true })
    }
    fs.writeFileSync(httpControllerPath, '')
  }
  if (type.includes('sockets')) {
    let socketsControllerPath = [CWD, 'controllers', 'sockets']
    if (isMultiController) {
      socketsControllerPath.push('index.ts')
    } else {
      socketsControllerPath[2] += '.ts'
    }
    socketsControllerPath = path.join(...socketsControllerPath)
    const socketsControllerDir = path.dirname(socketsControllerPath)
    if (!fs.existsSync(socketsControllerDir)) {
      fs.mkdirSync(socketsControllerDir, { recursive: true, force: true })
    }
    fs.writeFileSync(socketsControllerPath, '')
  }
  if (type.includes('workers')) {
    let workersControllerPath = [CWD, 'controllers', 'workers']
    if (isMultiController) {
      workersControllerPath.push('index.ts')
    } else {
      workersControllerPath[2] += '.ts'
    }
    workersControllerPath = path.join(...workersControllerPath)
    const workersControllerDir = path.dirname(workersControllerPath)
    if (!fs.existsSync(workersControllerDir)) {
      fs.mkdirSync(workersControllerDir, { recursive: true, force: true })
    }
    fs.writeFileSync(workersControllerPath, '')
  }
  if (boot === 'manual') {
    const mainPath = path.join(process.env.PWD || process.cwd(), 'main.ts')
    if (!fs.existsSync(mainPath)) {
      const mainDir = path.dirname(mainPath)
      fs.mkdirSync(mainDir, { recursive: true, force: true })
      fs.writeFileSync(mainPath, '')
    }
  }
  const declarationsPath = path.join(CWD, 'declarations.d.ts')
  if (!fs.existsSync(declarationsPath)) {
    fs.writeFileSync(declarationsPath, "import 'px.io'\nimport 'px.io/server'\nimport 'px.io/http'\nimport 'px.io/sockets'", { encoding: 'utf-8' })
  }
  const tsConfigPath = path.join(CWD, 'tsconfig.json')
  if (!fs.existsSync(tsConfigPath)) {
    fs.writeFileSync(tsConfigPath, JSON.stringify({
      "compilerOptions": {
        "baseUrl": ".",
        "declaration": true,
        "emitDeclarationOnly": true,
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        "target": "ES6",
        "moduleResolution": "Node",
        "sourceMap": true,
        "strictNullChecks": true,
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "module": "ES2022"
      }
    }, null, '\t'))
  }
  const VSCodeConfigPath = path.join(CWD, '.vscode', 'settings.json')
  if (!fs.existsSync(VSCodeConfigPath)) {
    const { yesNo } = await prompt([
      {
        type: 'list',
        name: 'yesNo',
        message: '¿Deseas agregar configuración de VSCode?',
        choices: [
          { name: 'Sí', value: true },
          { name: 'No', value: false },
        ],
        validate: (answer) => {
          if (!answer) {
            return 'Debes seleccionar una opción.'
          }
          return true
        },
      },
    ])
    if (yesNo) {
      const VSCodeConfigDir = path.dirname(VSCodeConfigPath)
      if (!fs.existsSync(VSCodeConfigDir)) {
        fs.mkdirSync(VSCodeConfigDir, { recursive: true, force: true })
      }
      fs.writeFileSync(VSCodeConfigPath, JSON.stringify({
        "files.exclude": {
          "**/.debugger": true,
          "**/node_modules": true,
          "**/tsconfig.json": true,
          "**/package-lock.json": true,
          "**/declarations.d.ts": true,
        }
      }, null, '\t'))
    }
  }
  const package = require(process.env.npm_package_json)
  const { scripts = {}, dependencies = {}, devDependencies = {} } = package
  if (!scripts.start) {
    scripts.start = 'pxio start'
  }
  if (!scripts.build) {
    scripts.build = 'pxio build'
  }
  package.scripts = scripts
  const dependenciesList = Object.keys(dependencies)
  const devDependenciesList = Object.keys(devDependencies)
  fs.writeFileSync(process.env.npm_package_json, JSON.stringify(package, null, '\t'))
  if (type.includes('http') && !dependenciesList.includes('express')) {
    log('Instalando ExpressJS ...')
    install('express')
  }
  if (type.includes('http') && !devDependenciesList.includes('@types/express')) {
    log('Instalando tipos de ExpressJS ...')
    install('@types/express', true)
  }
  if (type.includes('sockets') && !dependenciesList.includes('socket.io')) {
    log('Instalando Socket.IO ...')
    install('socket.io')
  }
  if (!devDependenciesList.includes('@types/node')) {
    log('Instalando @types/node ...')
    install('@types/node', true)
  }
  if (!devDependenciesList.includes('px.io')) {
    log('Instalando px.io ...')
    install('px.io', true)
  }
  log('PXIO Framework!\n')
}