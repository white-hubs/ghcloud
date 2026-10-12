import type { AbsRTC } from './abs-rtc';
import { RTCPlatformType } from './rtc-types'
import { TencentRTC } from './tencent-rtc';

/**
 * RTC 工厂类，用于创建不同平台的 RTC 实例
 */
export class RTCFactory {
  /**
   * 创建 RTC 实例
   * @param type RTC 平台类型
   * @param config RTC 配置
   * @returns RTC 实例
   */
  public static createRTC (type: RTCPlatformType, config?: any): AbsRTC {
    switch (type) {
      case RTCPlatformType.TENCENT:
        return new TencentRTC(config)
      // 添加其他平台的 case
      default:
        throw new Error(`不支持的 RTC 平台类型: ${type}`)
    }
  }
}