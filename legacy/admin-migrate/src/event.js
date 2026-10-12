import { Publisher, Subscriber, eventBus } from '@ghcloud/event-bus'

export const MFRootEventNameEnum = {
  MF_ROOT_HEALTH: 'mf-root-health',
  MF_ROOT_CHANGE_TENANT: 'mf-root-change-tenant',
  MF_ROOT_CHANGE_MENU:'mf-root-change-menu'
}

class MfRootPublisher extends Publisher {
  constructor() {
    super(MfRootPublisher.name, eventBus)
  }
  publish(eventName, data) {
    super.publish(eventName, data)
  }
}

export const publisher = new MfRootPublisher()

class MfRootSubscriber extends Subscriber {
  constructor() {
    super(MfRootSubscriber.name, eventBus)
  }

  subscribe(event, handler) {
    super.subscribe(event, handler)
  }
}

export const subscriber = new MfRootSubscriber()
