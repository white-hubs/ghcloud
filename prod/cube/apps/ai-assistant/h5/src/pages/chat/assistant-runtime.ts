import type { AssistantMessage, LlmOption, ToolEvent, TurnFailureSummary, TurnTokenUsage } from "@cube-ai/agent-sdk-client-vue";
import type { ImageAttachment, RuntimeRefs } from "@cube-ai/contracts";

import { resolveMessageInsight } from "./assistant-insights";
import type { ChatAttachment, ChatMessage, ComposerPendingAttachment, ConversationItem, KnowledgeItem, SkillItem } from "./types";
import { cubeAiApplicationService } from "@/api/ai-center-service";

export const DEFAULT_ASSISTANT_SESSION_TITLE = "新的对话";

interface GroupedShape {
  groupName?: string;
  items?: {
    modelCode?: string;
    displayName?: string | null;
    providerName?: string | null;
    endpointType?: string | null;
    modelTypes?: string[];
  }[];
}

interface FlatShape {
  modelCode?: string;
  displayName?: string | null;
  providerName?: string | null;
  endpointType?: string | null;
  modelTypes?: string[];
  groupName?: string;
}

function isGroupedShape(rows: unknown[]): rows is GroupedShape[] {
  return rows.some(
    (row) =>
      row != null &&
      typeof row === "object" &&
      Array.isArray((row as GroupedShape).items) &&
      ((row as FlatShape).modelCode == null || (row as FlatShape).modelCode === ""),
  );
}

function isEmbeddingModel(model: { endpointType?: string | null; modelTypes?: string[] | null }): boolean {
  const endpointType = (model.endpointType ?? "").trim().toLowerCase();
  if (endpointType === "embedding") {
    return true;
  }
  return (model.modelTypes ?? []).some((type) => String(type).toLowerCase() === "embedding");
}

export async function fetchLlmOptionsFromService(): Promise<LlmOption[]> {
  const raw = await cubeAiApplicationService.listTenantModels();
  const rows: unknown[] = Array.isArray(raw) ? raw : [];

  const flat: FlatShape[] = [];
  if (isGroupedShape(rows)) {
    for (const group of rows) {
      for (const item of group.items ?? []) {
        flat.push({ ...item, providerName: item.providerName ?? group.groupName ?? "" });
      }
    }
  } else {
    flat.push(...(rows as FlatShape[]));
  }

  return flat
    .filter((model) => !isEmbeddingModel(model) && typeof model.modelCode === "string" && model.modelCode !== "")
    .map((model) => ({
      modelCode: String(model.modelCode),
      displayName: model.displayName && String(model.displayName).trim() ? String(model.displayName) : String(model.modelCode),
      providerName: model.providerName ?? "",
    }));
}

export function formatAssistantSessionTitle(title: string | null | undefined): string {
  const trimmed = (title ?? "").trim();
  return trimmed === "" ? DEFAULT_ASSISTANT_SESSION_TITLE : trimmed;
}

export function formatMessageTime(timestamp: number | null | undefined): string {
  const value = typeof timestamp === "number" && Number.isFinite(timestamp) ? timestamp : Date.now();
  return new Date(value).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeTimestamp(timestamp: number | null | undefined): number {
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp)) {
    return Date.now();
  }
  return timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
}

function formatSessionDayLabel(timestamp: number | null | undefined): string {
  const date = new Date(normalizeTimestamp(timestamp));
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDiff = Math.floor((todayStart - dateStart) / 86_400_000);

  if (dayDiff <= 0) {
    return "今天";
  }
  if (dayDiff === 1) {
    return "昨天";
  }
  return "更早";
}

type AssistantAttachment = NonNullable<AssistantMessage["attachments"]>[number];

function toChatAttachment(attachment: AssistantAttachment): ChatAttachment | null {
  const url = attachment.previewUrl ?? "";
  if (typeof url !== "string" || url.length === 0) {
    return null;
  }
  const mimeType = attachment.mimeType ?? "";
  const name = attachment.fileId ?? attachment.attachmentId ?? "图片";
  const suffix = name.includes(".") ? name.split(".").at(-1) : mimeType.split("/").at(-1);
  return {
    id: attachment.attachmentId ?? attachment.fileId ?? url,
    name,
    url,
    kind: mimeType.toLowerCase().startsWith("image/") ? "image" : "file",
    ...(suffix ? { suffix } : {}),
  };
}

export function pendingToImageAttachments(pending: readonly ComposerPendingAttachment[]): ImageAttachment[] {
  return pending.map((item) => ({
    attachmentId: item.attachmentId,
    kind: "image",
    fileId: item.fileId,
    mimeType: item.mimeType,
    previewUrl: item.previewUrl,
    ...(item.size !== undefined ? { size: item.size } : {}),
  }));
}

export function mapAssistantMessage(
  message: AssistantMessage,
  options: {
    failure: TurnFailureSummary | null;
    liveTurnUsage: TurnTokenUsage | null;
    activeTurnId: string | null;
    toolEvents: readonly ToolEvent[];
    streaming: boolean;
  },
): ChatMessage | null {
  if (message.role !== "user" && message.role !== "assistant") {
    return null;
  }
  const attachments = message.attachments?.map(toChatAttachment).filter((item): item is ChatAttachment => item != null) ?? [];
  const isEmptyAssistant = message.role === "assistant" && message.content.trim() === "";
  const isStreamingAssistant = message.role === "assistant" && options.streaming && options.failure == null;
  const insight = resolveMessageInsight({
    message,
    liveTurnUsage: options.liveTurnUsage,
    activeTurnId: options.activeTurnId,
    toolEvents: options.toolEvents,
  });
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    time: formatMessageTime(message.createdAt),
    ...(message.turnId ? { turnId: message.turnId } : {}),
    sending: isStreamingAssistant,
    ...(isEmptyAssistant && options.failure != null ? { failureText: options.failure.message || "回复生成失败" } : {}),
    ...(insight != null ? { insight } : {}),
    ...(attachments.length > 0 ? { attachments } : {}),
  };
}

export function mapSessionToConversation(session: {
  id: string;
  title?: string | null;
  createdAt?: number | null;
  updatedAt?: number | null;
}): ConversationItem {
  return {
    id: session.id,
    title: formatAssistantSessionTitle(session.title),
    dayLabel: formatSessionDayLabel(session.updatedAt ?? session.createdAt),
  };
}

export function buildRuntimeRefs(input: {
  knowledgeIds: readonly string[];
  knowledgeList: readonly KnowledgeItem[];
  skillIds: readonly string[];
  skillList: readonly SkillItem[];
}): RuntimeRefs | undefined {
  if (input.knowledgeIds.length === 0 && input.skillIds.length === 0) {
    return undefined;
  }
  const knowledgeBases = input.knowledgeIds.map((id) => {
    const item = input.knowledgeList.find((candidate) => candidate.id === id);
    return {
      kbId: id,
      displayName: item?.name ?? id,
    };
  });
  const userSkills = input.skillIds.map((id) => {
    const item = input.skillList.find((candidate) => candidate.id === id);
    return {
      skillId: id,
      displayName: item?.name ?? id,
    };
  });
  return {
    ...(knowledgeBases.length > 0 ? { knowledgeBases } : {}),
    ...(userSkills.length > 0 ? { userSkills } : {}),
  };
}
