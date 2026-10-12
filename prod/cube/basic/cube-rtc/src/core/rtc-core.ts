import { RTCNotification } from './rtc-notification';
import type { RTCNotificationCallback } from './rtc-notification';

declare global {
  interface Window {
    __CUBE_RTC_CORE_INSTANCE__?: RTCCore;
  }
}

export class RTCCore {
  private static instance: RTCCore
  private constructor () {}
  public static getInstance (): RTCCore {
    if (!this.instance) {
      this.instance = window.__CUBE_RTC_CORE_INSTANCE__ ?? new RTCCore()
      window.__CUBE_RTC_CORE_INSTANCE__ = this.instance
    }
    return this.instance
  }

  /**
   * 注册事件监听
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  public registerEvent (eventName: string, callback: RTCNotificationCallback): void {
    RTCNotification.getInstance().register(eventName, callback)
  }

  /**
   * 取消注册事件监听
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  public unregisterEvent (eventName: string, callback: RTCNotificationCallback): void {
    RTCNotification.getInstance().unregister(eventName, callback)
  }

  /**
   * 发送通知
   * @param eventName 事件名称
   * @param arg 可选参数
   */
  public notifyEvent (eventName: string, arg?: any): void {
    RTCNotification.getInstance().notify(eventName, arg)
  }
}