import { Publisher, Subscriber, eventBus, type CubeEventSubscribe } from "@ghcloud/event-bus";

/**
 * The complete theme contract published by the shell.
 *
 * Keep this separate from the legacy `MF_ROOT_CHANGE_SKIN` event: existing
 * applications still expect that event's payload to be a primary-color string.
 */
export interface MFRootThemePayload {
  mode: "dawn-blue" | "night-black";
  primaryColor: string;
}

export enum MFRootEventNameEnum {
  MF_ROOT_HEALTH = "mf-root-health",
  MF_ROOT_CHANGE_TENANT = "mf-root-change-tenant",
  MF_ROOT_CHANGE_MENU = "mf-root-change-menu",
  MF_ROOT_CHANGE_SKIN = "mf-root-change-skin",
  MF_ROOT_CHANGE_THEME = "mf-root-change-theme",
  MF_ROOT_TO_APPLICATION = "mf-root-to-application",
  MF_ROOT_MESSAGE_COUNT = "mf-root-message-count",
  MF_ROOT_CHANGE_TERMINAL_ALIAS = "mf-root-change-terminal-alias",
}

class MfRootPublisher extends Publisher {
  public constructor() {
    super(MfRootPublisher.name, eventBus);
  }

  public override publish<T>(event: MFRootEventNameEnum, data: T): void {
    super.publish(event, data);
  }
}

export const publisher = new MfRootPublisher();

class MfRootSubscriber extends Subscriber {
  public constructor() {
    super(MfRootSubscriber.name, eventBus);
  }

  public override subscribe<T>(event: MFRootEventNameEnum, handler: (info: CubeEventSubscribe<T>) => void): void {
    super.subscribe(event, handler);
  }
}

export const subscriber = new MfRootSubscriber();
