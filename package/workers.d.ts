declare global {
  namespace PXIOWorkers {
    interface EventArgs<T = any> {
      eventName: string
      data: T
    } 
    type Middleware = <T = any>(args: PXIOWorkers.EventArgs<T>) => void
    interface Middlewares<C = any> {
      before?: Array<keyof C | PXIOWorkers.Middleware>
      after?: Array<keyof C | PXIOWorkers.Middleware>
    }
  }
  function Middlewares<C = any>(mws?: PXIOWorkers.Middlewares<C>): <T extends new (...args: any[]) => {}>(constructor: T) => void
  function After<C = any>(middleware: Array<keyof C | PXIOWorkers.Middleware>): (target: Object, propertyKey: string) => void
  function Before<C = any>(middleware: Array<keyof C | PXIOWorkers.Middleware>): (target: Object, propertyKey: string) => void
}

export { }