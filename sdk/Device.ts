import UA from "ua-device";
import Upload from "./Upload";

interface Version {
  original: string,
  alias: string
}

interface IUAResponse {
  browser: {
    name: string
    channel: string
    version: Version
  },
  engine: {
    name: string,
    version: Version
  },
  os: {
    name: string,
    version: Version
  },
  device: { // 硬件信息
    type: string,
    manufacturer: string,
    model: string
  }
}

interface IDeviceInfo {
  device_browser_name?: string;
  device_browser_version?: string;
  device_engine_name?: string;
  device_engine_version?: string;
  device_os_name?: string;
  device_os_version?: string;
}

/** msg?.en
 * 上传设备信息
 */
export default class Device {
  upload: Upload

  constructor(upload: Upload) {
    this.upload = upload
    this.upInfo()
  }

  /**
   * 获取设备信息
   */
  static getDeviceInfo (): IDeviceInfo | null {
    if (window.navigator && window.navigator.userAgent) {
      const device: IUAResponse = new UA(window.navigator.userAgent)

      const device_os_name =  device?.os?.name
      // 操作系统版本
      const device_os_version = device?.os.version?.original
      // 浏览器名称
      const device_browser_name = device?.browser?.name
      // 浏览器版本
      const device_browser_version = device?.browser?.version?.original
      // 浏览器核心
      const device_engine_name = device?.engine?.name

      const device_engine_version = device?.engine?.version?.original


      return {
        device_browser_name,
        device_browser_version,
        device_engine_name,
        device_engine_version,
        device_os_name,
        device_os_version
      }
    }
    return null
  }

  upInfo (): void {
    const res = Device.getDeviceInfo()
    if (res) {
      this.upload.add({
        type: 'device',
        ...res
      })
    }
  }
}
