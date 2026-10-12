import type {
  PersistedTokenUsage,
  ReasoningStep,
  ReasoningTree,
  TokenUsageSnapshot,
  TokenUsageTriplet,
  ToolEvent,
} from "@cube-ai/agent-sdk-client-vue";

export type MessageRole = "user" | "assistant";

export type ChatAttachmentKind = "image" | "file";

export interface ChatAttachment {
  id: string;
  name: string;
  url: string;
  kind: ChatAttachmentKind;
  size?: number;
  suffix?: string;
}

export interface ComposerPendingAttachment {
  attachmentId: string;
  fileId: string;
  mimeType: string;
  previewUrl: string;
  name: string;
  size?: number;
  localPreviewUrl?: string;
}

export interface ChatTokenUsage {
  cumulative: TokenUsageTriplet;
  items: TokenUsageSnapshot[];
  terminalKind?: PersistedTokenUsage["terminalKind"];
  approximate: boolean;
}

export interface ChatMessageInsight {
  reasoning?: ReasoningTree;
  reasoningSteps?: ReasoningStep[];
  toolEvents?: ToolEvent[];
  tokenUsage?: ChatTokenUsage;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  time: string;
  turnId?: string;
  insight?: ChatMessageInsight;
  attachments?: ChatAttachment[];
  sending?: boolean;
  failureText?: string;
}

export interface ConversationItem {
  id: string;
  title: string;
  dayLabel: string;
  messages?: ChatMessage[];
}

export interface KnowledgeItem {
  id: string;
  name: string;
}

export interface SkillItem {
  id: string;
  name: string;
}
