import mitt from 'mitt'
import type { EventName } from './event-name'

const eventBus = mitt()

export class EventCore {
  private static readonly registerMap = new Map()
  public static registerEvent (eventName: EventName, callback): void {
    eventBus.on(eventName, callback)
    this.registerMap.set(eventName, callback)
  }

  public emitEvent (eventName: EventName, args?: unknown): void {
    if (!EventCore.registerMap.has(eventName)) {
      throw new Error(`${eventName} is not implemented`)
    }
    eventBus.emit(eventName, args)
  }
}
