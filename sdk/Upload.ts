import axios from 'axios'
import cache from './Cache'

interface IErrorMap {
  [key: string]: boolean
}

export default class Upload {

  public apiKey: string
  // 上传的node服务地址
  public uploadHost: string;

  // 额外附加的数据
  public metadata: any

  // 已经收集过的数据
  public errorMap:IErrorMap = {}

  // 需要发送的错误内容
  public queue: any[] = []

  public customizeRequest?: (data: any) => any

  timer: any = -1

  public constructor(uploadHost: string, apiKey: string, metadata?: {}) {
    this.uploadHost = uploadHost
    this.apiKey = apiKey
    this.metadata = metadata;
  }

  add (data: any) {
    if (cache.checkCache(data)) {
      this.queue.push(this.formatCustomizeRequest(data))
    }

    if (this.timer !== -1) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => {
      this.send()
      this.timer = -1
    }, 2000)
  }

  send () {
    if (!this.queue.length) return
    axios.post(this.uploadHost, this.queue, {
      headers: { apiKey: this.apiKey }
    })
    this.queue = []
  }

  formatCustomizeRequest (data: any) {
    if (typeof this.customizeRequest === 'function') {
      return this.customizeRequest(data)
    }
    return data
  }
}
