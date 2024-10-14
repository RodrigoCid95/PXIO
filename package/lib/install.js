const fs = require('node:fs')
const path = require('node:path')
const readline = require('node:readline')

const install = (name, dev = false) => {
  const { execSync } = require('node:child_process')
  const result = execSync(`npm i ${name}${dev ? ' -D' : ''}`, { encoding: 'utf-8', cwd: process.env.PDW })
  console.log(result)
}
module.exports = async (type, log) => {
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
  const declarationsPath = path.join(process.env.PWD || process.cwd(), 'declarations.d.ts')
  if (!fs.existsSync(declarationsPath)) {
    fs.writeFileSync(declarationsPath, "import 'px.io'\nimport 'px.io/server'\nimport 'px.io/http'\nimport 'px.io/sockets'", { encoding: 'utf-8' })
  }
  const tsConfigPath = path.join(process.env.PWD || process.cwd(), 'tsconfig.json')
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
        "module": "ES2022",
        "paths": {
          "config/*": [
            "config/*"
          ],
          "controllers/*": [
            "controllers/*"
          ],
          "libraries/*": [
            "libraries/*"
          ],
          "models/*": [
            "models/*"
          ]
        }
      }
    }, null, '\t'))
  }
  const VSCodeConfigPath = path.join(process.env.PWD || process.cwd(), '.vscode', 'settings.json')
  if (!fs.existsSync(VSCodeConfigPath)) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    const res = await new Promise((resolve) => {
      rl.question('¿Deseas agregar configuración de VSCode? (s/n): ', (answer = 'n') => {
        rl.close()
        resolve(answer.toLowerCase() === 's')
      })
    })
    if (res) {
      fs.writeFileSync(VSCodeConfigPath, JSON.stringify({
        "files.exclude": {
          "**/.debugger": true,
          "**/node_modules": true,
          "**/tsconfig.json": true,
          "**/package*": true,
          "**/declarations.d.ts": true,
        }
      }, null, '\t'))
    }
  }
  log('PXIO Framework!\n')
}