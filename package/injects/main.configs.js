const getConfig = (name) => require('./modules/configs').default(name)

export { getConfig }