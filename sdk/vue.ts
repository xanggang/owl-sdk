
import LogSdk from './index'

class LogSdkVue extends LogSdk {
  // vue.use
  install (Vue: any) {
    const errorHandler = (error: any, vm: any, info: any)=>{
      if (error.isHandle) {
        return
      }
      error.isHandle = true
      const _oldOnError = Vue.config.errorHandler
      this.emitVueError(error, vm)
      _oldOnError.call(Vue, error, vm, info)
    }
    Vue.config.errorHandler = errorHandler
  }
}

export default LogSdkVue
