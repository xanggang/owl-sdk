import Upload from './Upload'

interface TimingObj {
  // 页面加载完成的时间
  load_page: number,
  // 解析 DOM 树结构的时间
  dom_ready: number,
  // 重定向的时间
  redirect: number,
  // DNS 查询时间
  lookup_domain: number,
  // 读取页面第一个字节的时间
  ttfb: number,
  // 内容加载完成的时间
  request: number,
  // 执行 onload 回调函数的时间
  load_event: number,
  // DNS 缓存时间
  appcache: number,
  // TCP 建立连接完成握手的时间
  connect: number
}

export default class Performance {
  upload: Upload

  constructor (upload: Upload) {
    this.upload = upload
    this.getTiming()
  }

  getTiming () {
    const performance = window.performance;

    if (!performance) {
      // 当前浏览器不支持
      console.warn('你的浏览器不支持 performance 接口')
      return
    }

    const t = performance.timing
    // 初次执行 dom 元素未挂载完成, performance对象未完全生成
    // 暂时通过定时器解决
    if (!t.loadEventEnd) {
      setTimeout(() => {
        this.getTiming()
      }, 1000)
      return
    }

    const times: TimingObj = {

      //【重要】页面加载完成的时间
      //【原因】这几乎代表了用户等待页面可用的时间
      load_page: t.loadEventEnd - t.navigationStart,

      //【重要】解析 DOM 树结构的时间
      //【原因】反省下你的 DOM 树嵌套是不是太多了！
      dom_ready: t.domComplete - t.responseEnd,

      //【重要】重定向的时间
      //【原因】拒绝重定向！比如，http://example.com/ 就不该写成 http://example.com
      redirect: t.redirectEnd - t.redirectStart,

      //【重要】DNS 查询时间
      //【原因】DNS 预加载做了么？页面内是不是使用了太多不同的域名导致域名查询的时间太长？
      lookup_domain: t.domainLookupEnd - t.domainLookupStart,

      //【重要】读取页面第一个字节的时间
      //【原因】这可以理解为用户拿到你的资源占用的时间，加异地机房了么，加CDN 处理了么？加带宽了么？加 CPU 运算速度了么？
      ttfb: t.responseStart - t.navigationStart,

      //【重要】内容加载完成的时间
      //【原因】页面内容经过 gzip 压缩了么，静态资源 css/js 等压缩了么？
      request: t.responseEnd - t.requestStart,

      //【重要】执行 onload 回调函数的时间
      //【原因】是否太多不必要的操作都放到 onload 回调函数里执行了，考虑过延迟加载、按需加载的策略么？
      load_event: t.loadEventEnd - t.loadEventStart,

      // DNS 缓存时间
      appcache: t.domainLookupStart - t.fetchStart,

      // TCP 建立连接完成握手的时间
      connect: t.connectEnd - t.connectStart,
    }

    // 兼容数据异常情况
    if (times.request > 10000) {
      this.upload.add({
        type: 'performance',
        ...times
      })
    }
  }
}
