import globalOnErrorHandler from './globalOnErrorHandler'
import globalOnUnhandledRejectionHandler from './globalOnUnhandledRejectionHandler'
import globalOnHttpXHRHandler from './globalOnHttpXHRHandler'
import globalVueErrorHandler from './globalVueErrorHandler'
import UserBehavior from '../UserBehavior'
import Upload from "../Upload";
import Device from '../Device'
import { computeStackTrace } from './util/tracekit'
import {
  eventFromStacktrace
} from './util/utils'

export default class ErrorHandle {
  upload: Upload
  userBehavior: UserBehavior
  deviceInfo: any

  constructor(upload: Upload) {
    this.upload = upload
    this.userBehavior = new UserBehavior()
    this.deviceInfo = Device.getDeviceInfo()
    this.instrumentError()
    this.instrumentUnhandledRejection()
    this.instrumentHttpXHR()
  }

  public formatData (res: any, type = 'error') {
    const data = Object.assign({}, res, {
      device: this.deviceInfo,
      userBehavior: this.userBehavior.pagePath,
      type,
    })
    console.log(data);
    this.upload.add(data)
  }

  public instrumentError() {
    const _oldOnErrorHandler = window.onerror;
    const that = this
    window.onerror = function(msg: any, url: any, line: any, column: any, error: any): boolean {
      const res = globalOnErrorHandler({ msg, url, line, column, error })

      if (_oldOnErrorHandler) {
        return _oldOnErrorHandler.call(null, msg, url, line, column, error);
      }
      that.formatData(res)
      return false;
    };
  }

  public instrumentUnhandledRejection(): void {
    const _oldOnUnhandledRejectionHandler = window.onunhandledrejection;
    const that = this
    window.onunhandledrejection = function(e: any): boolean {
      const res = globalOnUnhandledRejectionHandler(e)

      if (_oldOnUnhandledRejectionHandler) {
        return _oldOnUnhandledRejectionHandler.apply(this, e);
      }
      that.formatData(res)
      return true;
    };
  }

  public instrumentHttpXHR () {
    const oldXHR = window.XMLHttpRequest
    const that = this
    window.XMLHttpRequest = globalOnHttpXHRHandler(oldXHR, (res) => {
      if (res.url.includes(this.upload.uploadHost)) return
      this.formatData(res, 'api')
    })
  }

  public vueHandler(err: any, vm: any) {
    const event = globalVueErrorHandler(err, vm)
    this.formatData(event)
  }
}
