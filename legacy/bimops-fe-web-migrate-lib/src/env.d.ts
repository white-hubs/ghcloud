declare const __CUBE_EVENT_BUS_INSTANCE__: {
  subscribe: (eventName: string, subscriber: (data: unknown) => void) => void;
  unsubscribe: (eventName: string, subscriber: (data: unknown) => void) => void;
}