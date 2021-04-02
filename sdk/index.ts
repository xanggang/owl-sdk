import Upload from './Upload'
import Device from './Device'
import Performance from './Performance'
import ErrorHandle from './ErrorHandle'
import page from '../package.json'
export interface ILogSdkOptions {
  uploadHost: string
  errorWhiteList?: string[]
  apiKey: string
}

export default class LogSdk {
  version: string = page.version
  uploadHost = ''
  http: any
  errorWhiteList: string[] = []
  apiKey = ''
  upload: Upload
  device: Device
  errorHandle: ErrorHandle


  constructor(options: ILogSdkOptions) {
    this.checkOption(options)
    this.version = '0.0.1'
    this.uploadHost = options.uploadHost
    this.errorWhiteList = options.errorWhiteList || []
    this.apiKey = options.apiKey
    // 上传组件
    this.upload = new Upload(options.uploadHost, this.apiKey)
    this.device = new Device(this.upload)
    new Performance(this.upload)
    this.errorHandle = new ErrorHandle(this.upload, this.errorWhiteList)
  }

  checkOption (options: ILogSdkOptions) {
    if (!options.apiKey) {
      throw new Error('请填写正确的apiKey')
    }
    if (!options.uploadHost) {
      throw new Error('请填写正确的上传路径')
    }
  }

  emitVueError (error: any, vm: any) {
    this.errorHandle.vueHandler(error, vm)
  }

  emitCustomizeError (error: Error) {
    this.errorHandle.customizeErrorHandler(error)
  }
}
