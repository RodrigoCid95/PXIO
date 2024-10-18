#!/usr/bin/env node
'use strict';
(async (args) => {
  const [command] = args
  const log = (message) => {
    if (process.stdout.clearLine) {
      process.stdout.clearLine()
      process.stdout.cursorTo(0)
    }
    if (process.stdout.write) {
      process.stdout.write(message)
    } else {
      console.log(message)
    }
  }
  const loadConfig = require('./config')
  const config = await loadConfig(command === 'start')
  if (command && ['start', 'build'].includes(command)) {
    if (command === 'build') {
      const build = require('./build')
      build(config, log)
    } else {
      const watch = require('./watch')
      watch(config, log, args)
    }
  } else {
    const install = require('./install')
    install(config, log)
  }
})(process.argv.slice(2))