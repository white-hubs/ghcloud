import { nextTick, onBeforeUnmount, onMounted, ref, type Ref } from "vue";

import type { CubeAuth } from "@ghcloud/cube-protocol";

import { AI_CHAT_EVENT, type AIChatEventPayload, publishAIChatEvent, readAIChatMessagePayload } from "./assistant-chat-host-events";

/** {@link AssistantChatDrawer} 通过 expose 暴露给宿主的 imperative API。 */
export interface AssistantChatHostExpose {
  setDraft: (text: string) => void;
  submitMessage: (text: string) => Promise<void>;
  createNewConversation: () => Promise<void>;
  close: () => void;
  /**
   * 将孪生指令执行回执写到对应 assistant 消息气泡上（覆盖「已识别模型指令」），
   * 不另起一条沉底消息。
   */
  setCommandAckForMessage: (messageId: string, text: string) => void;
}

export interface UseAssistantChatHostOptions {
  resolveAuth: () => CubeAuth | null;
  assistantRef: Ref<AssistantChatHostExpose | null>;
  /** 宿主控制面板显隐（如 drawer.open / ue5 openStatus） */
  isOpen: Ref<boolean>;
  onResponse?: (payload: AIChatEventPayload) => void;
  onThinking?: (payload: AIChatEventPayload) => void;
}

/**
 * 主壳 / 大屏嵌入 {@link AssistantChatDrawer} 时的通用宿主逻辑：
 * auth 同步、跨页面事件总线、submitMessage 走 SDK assistant store。
 */
export function useAssistantChatHost(options: UseAssistantChatHostOptions) {
  const authInfo = ref<CubeAuth | null>(null);
  const initialDraft = ref("");
  const chatContext = ref<Record<string, unknown>>({});

  function syncAuthInfo(): void {
    authInfo.value = options.resolveAuth();
  }

  async function openDrawer(payload: AIChatEventPayload = {}): Promise<void> {
    syncAuthInfo();
    chatContext.value = payload.context ?? {};
    initialDraft.value = payload.draft ?? payload.message ?? "";
    options.isOpen.value = true;
    await nextTick();
    if (initialDraft.value) {
      options.assistantRef.value?.setDraft(initialDraft.value);
    }
  }

  function closeDrawer(emitEvent = true): void {
    options.isOpen.value = false;
    if (emitEvent) {
      publishAIChatEvent(AI_CHAT_EVENT.CLOSE, { context: chatContext.value });
    }
  }

  async function setDraft(payload: AIChatEventPayload): Promise<void> {
    const draft = payload.draft ?? payload.message ?? "";
    if (!draft) {
      return;
    }
    if (!options.isOpen.value) {
      await openDrawer(payload);
      return;
    }
    chatContext.value = payload.context ?? chatContext.value;
    await nextTick();
    options.assistantRef.value?.setDraft(draft);
  }

  async function submitMessage(payload: AIChatEventPayload): Promise<void> {
    const message = payload.message ?? payload.draft ?? "";
    if (!message) {
      return;
    }
    if (!options.isOpen.value) {
      await openDrawer(payload);
    }
    chatContext.value = payload.context ?? chatContext.value;
    await nextTick();
    await options.assistantRef.value?.submitMessage(message);
  }

  function handleCustomEvent(event: Event): void {
    const payload = (event as CustomEvent<AIChatEventPayload>).detail ?? {};
    if (event.type === AI_CHAT_EVENT.OPEN) {
      void openDrawer(payload);
    }
    if (event.type === AI_CHAT_EVENT.CLOSE) {
      closeDrawer(false);
    }
    if (event.type === AI_CHAT_EVENT.SET_DRAFT) {
      void setDraft(payload);
    }
    if (event.type === AI_CHAT_EVENT.SUBMIT) {
      void submitMessage(payload);
    }
  }

  function handleWindowMessage(event: MessageEvent): void {
    const data = readAIChatMessagePayload(event);
    if (data == null) {
      return;
    }
    if (data.type === AI_CHAT_EVENT.OPEN) {
      void openDrawer(data.payload);
    }
    if (data.type === AI_CHAT_EVENT.CLOSE) {
      closeDrawer(false);
    }
    if (data.type === AI_CHAT_EVENT.SET_DRAFT) {
      void setDraft(data.payload);
    }
    if (data.type === AI_CHAT_EVENT.SUBMIT) {
      void submitMessage(data.payload);
    }
  }

  function handleReady(): void {
    publishAIChatEvent(AI_CHAT_EVENT.READY, { context: chatContext.value });
  }

  function handleResponse(payload: AIChatEventPayload): void {
    publishAIChatEvent(AI_CHAT_EVENT.RESPONSE, payload);
    options.onResponse?.(payload);
  }

  function handleThinking(payload: AIChatEventPayload): void {
    publishAIChatEvent(AI_CHAT_EVENT.THINKING, payload);
    options.onThinking?.(payload);
  }

  function handleSessionChange(payload: AIChatEventPayload): void {
    publishAIChatEvent(AI_CHAT_EVENT.STATE_CHANGE, payload);
  }

  function handleStateChange(payload: AIChatEventPayload): void {
    publishAIChatEvent(AI_CHAT_EVENT.STATE_CHANGE, payload);
  }

  onMounted(() => {
    syncAuthInfo();
    window.addEventListener(AI_CHAT_EVENT.OPEN, handleCustomEvent);
    window.addEventListener(AI_CHAT_EVENT.CLOSE, handleCustomEvent);
    window.addEventListener(AI_CHAT_EVENT.SET_DRAFT, handleCustomEvent);
    window.addEventListener(AI_CHAT_EVENT.SUBMIT, handleCustomEvent);
    window.addEventListener("message", handleWindowMessage);
  });

  onBeforeUnmount(() => {
    window.removeEventListener(AI_CHAT_EVENT.OPEN, handleCustomEvent);
    window.removeEventListener(AI_CHAT_EVENT.CLOSE, handleCustomEvent);
    window.removeEventListener(AI_CHAT_EVENT.SET_DRAFT, handleCustomEvent);
    window.removeEventListener(AI_CHAT_EVENT.SUBMIT, handleCustomEvent);
    window.removeEventListener("message", handleWindowMessage);
  });

  return {
    authInfo,
    initialDraft,
    chatContext,
    syncAuthInfo,
    openDrawer,
    closeDrawer,
    setDraft,
    submitMessage,
    handleReady,
    handleResponse,
    handleThinking,
    handleSessionChange,
    handleStateChange,
  };
}
