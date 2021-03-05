
export default function globalOnHttpXHRHandler (oldXHR: any, cb: (d: any) => void): any {
  return () => {
    const realXHR = new oldXHR()
    let requestObj: any = {}
    let xhr_open = realXHR.open
    let xhr_send = realXHR.send
    let headers:any = {}
    let setRequestHeader = realXHR.setRequestHeader
    realXHR.open = function (...args: any) {
      requestObj = Object.assign({}, requestObj, {
        method: args[0],
        url: args[1],
      })
      xhr_open.apply(this, args)
    }
    realXHR.send = function (...args: any) {
      requestObj = Object.assign({}, requestObj, {
        body: args[0]
      })
      xhr_send.apply(this, args)
    }
    realXHR.setRequestHeader = function (...args: any) {
      // 在这里，我们加入自己的获取逻辑
      headers[args[0]] = args[1]
      setRequestHeader.apply(this, args)
    }
    realXHR.addEventListener('loadend', (ev: any) => {
      ev.headers = JSON.stringify(headers)
      ev.request = JSON.stringify(requestObj)
      ev.url = requestObj.url
      cb(ev)
    }, false)
    return realXHR
  }
}
