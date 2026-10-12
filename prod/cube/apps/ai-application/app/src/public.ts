import { ensureCryptoRandomUUIDPolyfill } from "./util/crypto-random-uuid";

/**
 * 宿主（bimops / UE5）只 import 本包，不会执行 main.ts。
 * main.ts 里已有的 crypto.randomUUID 兜底必须在此同步执行，否则嵌入侧与独立跑 ai-application 行为不一致。
 */
ensureCryptoRandomUUIDPolyfill();

export { AssistantChatDrawer, type AssistantChatDrawerContext } from "./assistant-drawer";
export {
  AI_CHAT_EVENT,
  type AIChatEventName,
  type AIChatEventPayload,
  publishAIChatEvent,
  readAIChatMessagePayload,
} from "./host/assistant-chat-host-events";
export { useAssistantChatHost, type AssistantChatHostExpose } from "./host/use-assistant-chat-host";
export {
  COPY_MODEL_COMMAND_FAIL,
  COPY_MODEL_COMMAND_NON_TWIN,
  COPY_MODEL_COMMAND_RECOGNIZED,
  COPY_MODEL_COMMAND_SUCCESS,
  formatModelCommandAck,
  isTwinAssistantHost,
  normalizeLegacyAssistantCommand,
  parseAssistantCommandFromContent,
  readAssistantMessageContent,
  readAssistantMessageId,
  resolveAssistantCommandDisplay,
  type LegacyAssistantCommand,
} from "./host/assistant-command";
