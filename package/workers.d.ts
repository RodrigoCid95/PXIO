declare global {
  namespace PXIOWorkers {
    interface EventArgs<T = any> {
      eventName: string
      data: T
    } 
    type Middleware = <T = any>(args: PXIOWorkers.EventArgs<T>) => void
    interface Middlewares {
      before?: PXIOWorkers.Middleware[]
      after?: PXIOWorkers.Middleware[]
    }
  }
  function Middlewares(mws?: PXIOWorkers.Middlewares): <T extends new (...args: any[]) => {}>(constructor: T) => void
  function After(middleware: Array<string | PXIOWorkers.Middleware>): (target: Object, propertyKey: string) => void
  function Before(middleware: Array<string | PXIOWorkers.Middleware>): (target: Object, propertyKey: string) => void
}

export { }