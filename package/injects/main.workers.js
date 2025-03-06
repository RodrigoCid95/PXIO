function initWorkerServer(isGlobal) {
  const crypto = require('node:crypto')
  let emit
  !SINGLE_PROCESS && (() => {
    const { fork } = require('node:child_process')
    const path = require('node:path')
    const EventEmitter = require('node:events')
    const emitter = new EventEmitter()
    const workersPath = path.join(__dirname, 'modules', 'workers.js')
    const child = fork(workersPath, process.argv)
    child.on('message', ({ id, data }) => emitter.emit(id, data))
    child.on('error', error => console.log(error))
    emit = (nameEvent, ...args) => {
      return new Promise(resolve => {
        const id = crypto.randomUUID()
        emitter.once(id, data => resolve(data))
        child.send({ id, nameEvent, args })
      })
    }
  })()
  SINGLE_PROCESS && (() => {
    const { workersEmitter, responseEmitter } = require('./modules/workers.js')
    emit = (nameEvent, ...args) => {
      return new Promise(resolve => {
        const id = crypto.randomUUID()
        responseEmitter.once(id, data => resolve(data))
        workersEmitter.emit(nameEvent, id, args)
      })
    }
  })()
  if (isGlobal) {
    Object.defineProperty(global, 'emitToWorker', {
      value: emit,
      writable: false
    })
  }
  return emit
}

export { initWorkerServer }