export const AI_CHAT_EVENT = {
  OPEN: "CUBE_AI_CHAT_OPEN",
  CLOSE: "CUBE_AI_CHAT_CLOSE",
  SET_DRAFT: "CUBE_AI_CHAT_SET_DRAFT",
  SUBMIT: "CUBE_AI_CHAT_SUBMIT",
  READY: "CUBE_AI_CHAT_READY",
  RESPONSE: "CUBE_AI_CHAT_RESPONSE",
  THINKING: "CUBE_AI_CHAT_THINKING",
  STATE_CHANGE: "CUBE_AI_CHAT_STATE_CHANGE",
} as const;

export type AIChatEventName = (typeof AI_CHAT_EVENT)[keyof typeof AI_CHAT_EVENT];

export interface AIChatEventPayload {
  draft?: string;
  message?: string;
  context?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AIChatWindowMessage {
  type?: string;
  data?: AIChatEventPayload;
  detail?: AIChatEventPayload;
}

export function publishAIChatEvent(type: AIChatEventName, payload: AIChatEventPayload = {}): void {
  window.dispatchEvent(new CustomEvent(type, { detail: payload }));
  if (window.parent !== window) {
    window.parent.postMessage({ type, data: payload }, "*");
  }
}

export function readAIChatMessagePayload(event: MessageEvent): { type: AIChatEventName; payload: AIChatEventPayload } | null {
  const data = event.data as AIChatWindowMessage | undefined;
  if (data == null || typeof data !== "object" || typeof data.type !== "string") {
    return null;
  }
  if (!Object.values(AI_CHAT_EVENT).includes(data.type as AIChatEventName)) {
    return null;
  }
  return {
    type: data.type as AIChatEventName,
    payload: data.data ?? data.detail ?? {},
  };
}
