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
  system?: string
  system_version?: string
  browser_type?: string
  browser_name?: string
  browser_version?: string
  browser_core?: string
}

/**
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

      const system = device?.os?.name
      // 操作系统版本
      const system_version = device?.os.version?.original
      // 浏览器类型
      const browser_type = device?.browser?.channel
      // 浏览器名称
      const browser_name = device?.browser?.name
      // 浏览器版本
      const browser_version = device?.browser?.version.original
      // 浏览器核心
      const browser_core = device?.engine?.name

      return {
        system,
        system_version,
        browser_type,
        browser_name,
        browser_version,
        browser_core
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
