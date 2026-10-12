import type { ReasoningStep } from "@cube-ai/agent-sdk-client-vue";

import { COPY_NO_USER_AGENTS } from "./assistant-chat-strings";
import type { ComposerPendingAttachment } from "./assistant-multimodal";
import { matchesSearchText } from "./assistant-search";

export const DEFAULT_ASSISTANT_SESSION_TITLE = "新的对话";

/** 平台内置工具名（与 tool-call reasoning step 的 `toolName` 对齐）。 */
export const KNOWLEDGE_TOOL_NAME = "platform.knowledge.query";
export const RUNTIME_SKILL_REFS_TOOL_NAME = "runtime.skill.refs";

/** tool-call step 的原始工具名；缺失 `toolName` 时从 `label`（"调用 xxx"）里剥离兜底。 */
export function reasoningToolName(step: ReasoningStep): string {
  return step.toolName ?? step.label.replace(/^调用\s+/, "");
}

/**
 * tool-call step 的展示用标签：内置工具映射为中文友好名，其余工具原样使用 step.label
 * （reducer 生成时固定为 "调用 {toolName}"，不随流式文本变化，可安全复用于粗粒度状态展示）。
 */
export function reasoningStepLabel(step: ReasoningStep): string {
  const toolName = reasoningToolName(step);
  if (toolName === KNOWLEDGE_TOOL_NAME) {
    return "知识库检索";
  }
  if (toolName === RUNTIME_SKILL_REFS_TOOL_NAME) {
    return "技能引用";
  }
  return step.label;
}

export interface ReasoningStepIndex {
  topLevel: ReasoningStep[];
  childrenByParent: Map<string, ReasoningStep[]>;
}

/** 按 parentStepId 建索引，供 ReasoningTreeView 递归渲染 lifecycle → tool-loop → tool-call。 */
export function indexReasoningSteps(steps: readonly ReasoningStep[]): ReasoningStepIndex {
  const topLevel: ReasoningStep[] = [];
  const childrenByParent = new Map<string, ReasoningStep[]>();
  for (const step of steps) {
    if (step.parentStepId) {
      const list = childrenByParent.get(step.parentStepId) ?? [];
      list.push(step);
      childrenByParent.set(step.parentStepId, list);
    } else {
      topLevel.push(step);
    }
  }
  return { topLevel, childrenByParent };
}

export function getReasoningStepChildren(stepId: string, childrenByParent: ReadonlyMap<string, ReasoningStep[]>): ReasoningStep[] {
  return childrenByParent.get(stepId) ?? [];
}

/**
 * 是否渲染为可展开的 `<details>`（而非灰色单行 `thinkingStepEmpty`）。
 * tool-loop 在无 reasoning 文本时，只要有 tool-call / 子 model-reasoning 子节点即可展开。
 */
export function reasoningStepHasExpandableBody(
  step: ReasoningStep,
  childrenByParent: ReadonlyMap<string, ReasoningStep[]>,
  hasToolBody: boolean,
): boolean {
  if (step.text.trim() !== "") {
    return true;
  }
  if (hasToolBody) {
    return true;
  }
  const children = getReasoningStepChildren(step.stepId, childrenByParent);
  if (children.length === 0) {
    return false;
  }
  if (step.kind !== "tool-loop") {
    return true;
  }
  return children.some((child) => child.kind === "tool-call" || child.kind === "model-reasoning" || child.text.trim() !== "");
}

export type AssistantComposerReferenceType = "kb" | "skill";
export type AssistantReferenceMenuType = AssistantComposerReferenceType;

export interface ActiveReferenceTrigger {
  trigger: "@" | "/";
  menuType: AssistantReferenceMenuType;
  start: number;
  end: number;
  query: string;
}

export function findActiveReferenceTrigger(text: string, caret: number): ActiveReferenceTrigger | null {
  const beforeCaret = text.slice(0, caret);
  const atMatch = beforeCaret.match(/(^|\s)@([^\s@/]*)$/);
  if (atMatch && atMatch.index != null) {
    const prefix = atMatch[1] ?? "";
    return {
      trigger: "@",
      menuType: "kb",
      start: atMatch.index + prefix.length,
      end: caret,
      query: atMatch[2] ?? "",
    };
  }
  const slashMatch = beforeCaret.match(/(^|\s)\/([^\s@/]*)$/);
  if (slashMatch && slashMatch.index != null) {
    const prefix = slashMatch[1] ?? "";
    return {
      trigger: "/",
      menuType: "skill",
      start: slashMatch.index + prefix.length,
      end: caret,
      query: slashMatch[2] ?? "",
    };
  }
  return null;
}

export interface AssistantComposerReference {
  type: AssistantComposerReferenceType;
  id: string;
  label: string;
  description: string;
}

export function composerReferenceKey(ref: Pick<AssistantComposerReference, "type" | "id">): string {
  return `${ref.type}:${ref.id}`;
}

export interface AssistantComposerDraft {
  inputText: string;
  selectedReferences: AssistantComposerReference[];
  pendingAttachments: ComposerPendingAttachment[];
}

export function createEmptyAssistantComposerDraft(): AssistantComposerDraft {
  return {
    inputText: "",
    selectedReferences: [],
    pendingAttachments: [],
  };
}

export interface AssistantSessionMessageLike {
  role: string;
  content?: string;
}

/** 尚无用户消息、也无助手正文回复，视为可替换的「新对话」。 */
export function isFreshAssistantSession(messages: readonly AssistantSessionMessageLike[]): boolean {
  return !messages.some((item) => item.role === "user" || (item.role === "assistant" && (item.content ?? "").trim() !== ""));
}

export async function removeSessionIfFresh(input: {
  messages: readonly AssistantSessionMessageLike[];
  sessionId: string | null;
  removeSession: (id: string) => Promise<void>;
  onRemoved?: (id: string) => void;
}): Promise<void> {
  const { messages, sessionId, removeSession, onRemoved } = input;
  if (!sessionId || !isFreshAssistantSession(messages)) {
    return;
  }
  try {
    await removeSession(sessionId);
  } catch {
    // 删除失败仍继续创建新会话，避免切换智能体卡住。
  }
  onRemoved?.(sessionId);
}

export function formatAssistantSessionTitle(title: string | null | undefined): string {
  const trimmed = (title ?? "").trim();
  return trimmed === "" ? DEFAULT_ASSISTANT_SESSION_TITLE : trimmed;
}

export function filterComposerReferences(
  refs: readonly AssistantComposerReference[],
  query: string,
  type: AssistantReferenceMenuType,
): AssistantComposerReference[] {
  const source = refs.filter((item) => item.type === type);
  if (query.trim() === "") {
    return [...source];
  }
  return source.filter((item) => matchesSearchText([item.label, item.description, item.id], query));
}

export interface AssistantNotify {
  warning: (text: string) => void;
}

/** 无个人智能体时弹出提示并返回 false，供发送/建会话守卫复用。 */
export function warnNoUserAgents(hasUserAgents: boolean, notify: AssistantNotify): boolean {
  if (hasUserAgents) {
    return true;
  }
  notify.warning(COPY_NO_USER_AGENTS);
  return false;
}
