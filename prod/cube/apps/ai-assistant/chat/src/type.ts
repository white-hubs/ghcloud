import type { MessageInfo } from '@ant-design/x/es/use-x-chat'

export interface ConversationType {
  conversation_id: string;
  name: string;
  active: boolean;
  message: MessageInfo<string>[];
  modelId?: string;
  mode: "CHAT" | "COMMAND";
}