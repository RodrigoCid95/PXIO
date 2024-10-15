function initWorkerServer(isGlobal) {
  const { fork } = require('node:child_process')
  const path = require('node:path')
  const { EventEmitter } = require('node:stream')
  const crypto = require('node:crypto')
  const emitter = new EventEmitter()
  const workersPath = path.join(__dirname, 'modules', 'workers.js')
  const child = fork(workersPath, process.argv)
  child.on('message', ({ id, data }) => {
    emitter.emit(id, data)
  })
  child.on('error', error => console.log(error))
  const emit = (nameEvent, ...args) => {
    return new Promise(resolve => {
      const id = crypto.randomUUID()
      emitter.once(id, data => resolve(data))
      child.send({ id, nameEvent, args })
    })
  }
  if (isGlobal) {
    Object.defineProperty(global, 'emitToWorker', {
      value: emit, writable: false
    })
  }
  return emit
}

export { initWorkerServer }