
import LogSdk from './index'

class LogSdkVue extends LogSdk {
  // vue.use
  install (Vue: any) {
    const errorHandler = (error: Error, vm: any, info: any)=>{
      const _oldOnError = Vue.config.errorHandler
      this.emitVueError(error, vm)
      // _oldOnError.call(this, error, vm, info);
    }
    Vue.config.errorHandler = errorHandler
    Vue.prototype.$throw = errorHandler
  }
}

export default LogSdkVue
