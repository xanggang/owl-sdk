interface IPagePathData {
  path: string;
  behavior: any[]
}

/**
 *  收集用户行为
 */
export default class UserBehavior {

  pagePath: IPagePathData[] = []

  get lastPath(): IPagePathData | undefined {
    return this.pagePath[this.pagePath.length -1]
  }

  constructor() {
    this.addEventListener()
  }

  addEventListener () {
    window.addEventListener('click', e => {
      this.onclickCallback(e)
      return true
    }, true)
  }

  onclickCallback (e: any) {
    const clickInfo = this.getClickInfo(e)

    if (clickInfo.router === this.lastPath?.path) {
      const obj = this.lastPath.behavior
      const happenTime = Math.floor(obj[obj.length - 1].happenTime /1000)
      if (happenTime !== Math.floor(clickInfo.happenTime / 1000)) {
        this.lastPath?.behavior.push(clickInfo)
      }
    } else {
      if(this.pagePath.length > 4) {
        this.pagePath.shift()
      }
      this.pagePath.push({
        path: clickInfo.router,
        behavior: [clickInfo]
      })
    }
  }
  /**
   * 获取点击时间信息
   * @param e
   */
  getClickInfo (e: any) {
    return {
      type: e.type,
      happenTime: new Date().getTime(),
      simpleUrl: window.location.href.split('?')[0],
      router: window.location.href.split('?')[0].split('/#/')[1] ? window.location.href.split('?')[0].split('/#/')[1] : '/',
      className: e.target.className,
      placeholder: e.target.placeholder || '',
      inputValue: e.target.value || '',
      tagName: e.target.tagName,
      innerText: e.target?.innerText?.replace(/\s*/g, "") || ''
    }
  }
}
