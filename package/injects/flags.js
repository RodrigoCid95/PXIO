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

export { getFlag }