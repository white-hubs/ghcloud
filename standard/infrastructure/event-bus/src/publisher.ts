import type { EventBus } from './main'

export interface CubeEventPublish <T> {
  // 事件来源
  origin: string;
  // 事件名
  event: string;
  // 数据
  data: T;
}

export class Publisher {
  protected constructor (protected readonly name: string, protected readonly eventBus: EventBus) {}

  public publish <T>(event: string, data: T): void {
    const eventInfo: CubeEventPublish<T> = {
      origin: this.name,
      event,
      data
    }
    this.eventBus.publish(event, JSON.stringify(eventInfo))
  }
}
