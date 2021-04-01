
export default function globalOnHttpXHRHandler (oldXHR: any, cb: (d: any) => void): any {
  return () => {
    const realXHR = new oldXHR()
    let requestObj: any = {}
    const xhr_open = realXHR.open
    const xhr_send = realXHR.send
    const headers:any = {}
    const setRequestHeader = realXHR.setRequestHeader
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
      const status = ev?.target?.status
      if (status === 200) return
      if (ev?.target?.readyState !== 4) return
      if (!ev?.target?.responseURL) return
      const headerString = JSON.stringify(headers)
      const request = JSON.stringify(requestObj)
      const url = requestObj.url
      const responseText = ev?.target?.responseText
      const requestTime = +new Date()
      cb({
        status,
        headers: headerString,
        request,
        url,
        response: responseText,
        request_time: requestTime,
      })
    }, false)
    return realXHR
  }
}
