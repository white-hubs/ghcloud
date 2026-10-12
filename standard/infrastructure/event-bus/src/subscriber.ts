import type { EventBus } from './main'
import type { CubeEventPublish } from './publisher'

export interface CubeEventSubscribe<D> {
  origin: string;
  event: string;
  data: D;
  timestamp: number;
}

export class Subscriber {
  protected constructor (protected readonly name: string, protected readonly eventBus: EventBus) {}

  public subscribe<T>(event: string, handler: (info: CubeEventSubscribe<T>) => void): void {
    this.eventBus.subscribe(event, (data) => {
      const response = JSON.parse(data) as CubeEventPublish<T>
      handler({
        origin: response.origin,
        event: response.event,
        data: response.data,
        timestamp: new Date().getTime()
      })
    })
  }
}
