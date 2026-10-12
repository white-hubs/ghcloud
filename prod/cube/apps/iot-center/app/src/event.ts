import { Publisher, Subscriber, eventBus, type CubeEventSubscribe } from '@ghcloud/event-bus'

export enum MFRootEventNameEnum {
  MF_ROOT_HEALTH = 'mf-root-health',
  MF_ROOT_CHANGE_TENANT = 'mf-root-change-tenant',
  MF_ROOT_CHANGE_MENU = 'mf-root-change-menu'
}

class MfRootPublisher extends Publisher {
  public constructor () {
    super(MfRootPublisher.name, eventBus)
  }

  public override publish <T> (event: MFRootEventNameEnum, data: T): void {
    super.publish(event, data)
  }
}

export const publisher = new MfRootPublisher()

class MfRootSubscriber extends Subscriber {
  public constructor () {
    super(MfRootSubscriber.name, eventBus)
  }

  public override subscribe <T> (event: MFRootEventNameEnum, handler: (info: CubeEventSubscribe<T>) => void): void {
    super.subscribe(event, handler)
  }
}

export const subscriber = new MfRootSubscriber()
