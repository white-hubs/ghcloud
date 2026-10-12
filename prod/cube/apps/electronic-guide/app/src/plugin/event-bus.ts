type CubeEvent = (data: unknown) => void
// EventBus.ts
export class EventBus {
  private events: Record<string, CubeEvent[]> = {}

  /**
   * 订阅事件
   * @param event 事件名称
   * @param callback 事件触发时调用的回调函数
   */
  public on (event: string, callback: (data: unknown) => void): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  /**
   * 一次性订阅事件，事件触发后自动取消订阅
   * @param event 事件名称
   * @param callback 事件触发时调用的回调函数
   */
  public once (event: string, callback: (data: unknown) => void): void {
    const wrappedCallback = (data: unknown): void => {
      this.off(event, wrappedCallback)
      callback(data)
    }
    this.on(event, wrappedCallback)
  }

  /**
   * 取消订阅事件
   * @param event 事件名称
   * @param callback 要取消的回调函数
   */
  public off (event: string, callback?: (data: unknown) => void): void {
    if (this.events[event]) {
      if (callback) {
        const index = this.events[event].indexOf(callback)
        if (index !== -1) {
          this.events[event].splice(index, 1)
        }
      } else {
        // 如果没有提供回调函数，则删除该事件的所有监听器
        Reflect.deleteProperty(this.events, event)
      }
    }
  }

  /**
   * 移除指定事件的所有监听器
   * @param event 事件名称
   */
  public removeAllListeners (event: string): void {
    this.off(event)
  }

  /**
   * 销毁EventBus实例，移除所有事件的所有监听器
   */
  protected destroy (): void {
    this.events = {}
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param data 传递给事件监听器的数据
   */
  protected emit (event: string, data: unknown): void {
    const callbacks = this.events[event]
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          throw new Error(`Error in event callback for ${event}:${JSON.stringify(error)}`)
          // (function(){})(`Error in event callback for ${event}:`, error)
        }
      })
    }
  }
}

export default EventBus
