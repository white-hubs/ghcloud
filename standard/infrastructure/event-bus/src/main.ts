type EventBusCallBack = (msg: string) => void

declare global {
  interface Window {
    __CUBE_EVENT_BUS_INSTANCE__?: EventBus;
  }
}

export class EventBus {
  static #singleInstance: EventBus

  public static instance (singleInstanceMode = true): EventBus {
    if (!singleInstanceMode) {
      return new EventBus()
    }
    if (!this.#singleInstance) {
      this.#singleInstance = window.__CUBE_EVENT_BUS_INSTANCE__ ?? new EventBus()
      window.__CUBE_EVENT_BUS_INSTANCE__ = this.#singleInstance
    }
    return this.#singleInstance
  }

  #subscribes = new Map<string, Set<EventBusCallBack>>()

  private constructor () {}

  /**
   * 发布消息
   * @param event 事件名
   * @param msg 发布内容
   */
  public async publish (event: string, msg: string): Promise<void> {
    const subscribers = this.getSubscribers(event)
    for (const subscriber of subscribers) {
      setTimeout(() => { subscriber(msg) })
    }
  }

  /**
   * 订阅事件
   * @param event 事件名
   * @param callback 事件回调
   */
  public subscribe (event: string, callback: EventBusCallBack): void {
    const subscribers = this.getSubscribers(event)
    subscribers?.add(callback)
  }

  /**
   * 取消订阅（所有订阅的事件必须存在取消订阅时机，否则极容易引起 `OOM`）
   * @param event 事件名
   * @param callback 订阅时的回调
   */
  public unsubscribe (event: string, callback: EventBusCallBack): void {
    const subscribes = this.#subscribes
    if (!subscribes.has(event)) {
      return
    }
    const subscribers = subscribes.get(event)
    subscribers?.delete(callback)
  }

  private getSubscribers (event: string): Set<EventBusCallBack> {
    const subscribes = this.#subscribes
    if (!subscribes.has(event)) {
      subscribes.set(event, new Set())
    }
    return subscribes.get(event)!
  }
}

export const eventBus = EventBus.instance()

export * from './publisher'
export * from './subscriber'
