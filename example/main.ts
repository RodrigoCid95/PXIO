initWorkerServer(true)

const { http } = initHttpServer({ onMessage: console.log })

initSocketsServer({ onError: console.log, http })

console.log(getFlag('foo'))