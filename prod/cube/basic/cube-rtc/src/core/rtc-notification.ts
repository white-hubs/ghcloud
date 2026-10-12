declare global {
  interface Window {
    __CUBE_RTC_NOTIFICATION_INSTANCE__?: RTCNotification;
  }
}

// 定义通知回调函数类型
export type RTCNotificationCallback = (arg: any) => void;

/**
 * 通知中心类 - 单例模式实现
 */
export class RTCNotification {
  private static instance: RTCNotification
  private constructor () {}
  public static getInstance (): RTCNotification {
    if (!this.instance) {
      this.instance = window.__CUBE_RTC_NOTIFICATION_INSTANCE__ ?? new RTCNotification()
      window.__CUBE_RTC_NOTIFICATION_INSTANCE__ = this.instance
    }
    return this.instance
  }

  // 消息队列，存储事件名称和对应的回调函数列表
  private _messageQueue: Record<string, RTCNotificationCallback[]> = {}

  /**
   * 注册事件监听
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  public register (eventName: string, callback: RTCNotificationCallback): void {
    if (eventName && callback) {
      if (!this._messageQueue[eventName]) {
        this._messageQueue[eventName] = []
      }
      this._messageQueue[eventName].push(callback)
    }
  }

  /**
   * 取消注册事件监听
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  public unregister (eventName: string, callback: RTCNotificationCallback): void {
    if (eventName && callback) {
      const list = this._messageQueue[eventName]
      if (list) {
        const index = list.indexOf(callback)
        if (index !== -1) {
          list.splice(index, 1)
        }
      }
    }
  }

  /**
   * 发送通知
   * @param eventName 事件名称
   * @param arg 可选参数
   */
  public notify (eventName: string, arg?: any): void {
    const list = this._messageQueue[eventName]
    if (list && list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        list[i](arg)
      }
    }
  }
}