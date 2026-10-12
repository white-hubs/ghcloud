import { resolveStepActivity } from "@cube-ai/agent-sdk-client-assistant";
import {
  hasVisibleReasoning,
  type AssistantMessage,
  type ReasoningStep,
  type TokenUsageSnapshot,
  type ToolEvent,
  type TurnTokenUsage,
} from "@cube-ai/agent-sdk-client-vue";

import { lookupExactToolLabel, resolveToolDisplayLabel } from "./assistant-tool-labels";
import type { ChatMessageInsight, ChatTokenUsage } from "./types";

export interface ReasoningStepIndex {
  topLevel: ReasoningStep[];
  childrenByParent: Map<string, ReasoningStep[]>;
}

export function indexReasoningSteps(steps: readonly ReasoningStep[]): ReasoningStepIndex {
  const topLevel: ReasoningStep[] = [];
  const childrenByParent = new Map<string, ReasoningStep[]>();
  const stepIds = new Set(steps.map((step) => step.stepId));
  for (const step of steps) {
    if (step.parentStepId && stepIds.has(step.parentStepId)) {
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

export function formatReasoningStepStatus(step: ReasoningStep): string {
  if (step.ok === undefined) {
    return "执行中";
  }
  if (step.ok) {
    return "成功";
  }
  return step.error?.code ? `失败（${step.error.code}）` : "失败";
}

export function formatTokenInline(input: number, output: number): string {
  return `输入 ${input.toLocaleString("zh-CN")} · 输出 ${output.toLocaleString("zh-CN")} tokens`;
}

export function terminalKindBadge(kind: ChatTokenUsage["terminalKind"] | undefined): string {
  if (kind === "cancelled") {
    return "（已取消）";
  }
  if (kind === "failed") {
    return "（失败）";
  }
  return "";
}

export function readTokenUsageItems(usage: Pick<ChatTokenUsage, "items"> | undefined): TokenUsageSnapshot[] {
  const items = usage?.items;
  return Array.isArray(items) ? items : [];
}

export function isApproximateTokenUsage(usage: Pick<ChatTokenUsage, "items">): boolean {
  return readTokenUsageItems(usage).some((item) => item.accuracy !== "final" || item.terminal != null);
}

export function pickMessageTokenUsage(
  message: AssistantMessage,
  liveTurnUsage: TurnTokenUsage | null,
  activeTurnId: string | null,
): ChatTokenUsage | undefined {
  if (message.tokenUsage) {
    return {
      cumulative: message.tokenUsage.cumulative,
      items: message.tokenUsage.items,
      terminalKind: message.tokenUsage.terminalKind,
      approximate: isApproximateTokenUsage(message.tokenUsage),
    };
  }
  if (
    liveTurnUsage != null &&
    activeTurnId != null &&
    message.turnId != null &&
    message.turnId === activeTurnId &&
    liveTurnUsage.turnId === activeTurnId
  ) {
    return {
      cumulative: liveTurnUsage.cumulative,
      items: liveTurnUsage.items,
      approximate: isApproximateTokenUsage(liveTurnUsage),
    };
  }
  return undefined;
}

export function aggregateUsageForStep(
  stepId: string,
  allSteps: readonly ReasoningStep[],
  items: readonly TokenUsageSnapshot[],
): { input: number; output: number } | null {
  if (items.length === 0) {
    return null;
  }
  const childrenByParent = new Map<string, string[]>();
  for (const step of allSteps) {
    if (step.parentStepId) {
      const list = childrenByParent.get(step.parentStepId) ?? [];
      list.push(step.stepId);
      childrenByParent.set(step.parentStepId, list);
    }
  }
  const subtreeIds = new Set<string>();
  const visit = (id: string): void => {
    if (subtreeIds.has(id)) {
      return;
    }
    subtreeIds.add(id);
    for (const child of childrenByParent.get(id) ?? []) {
      visit(child);
    }
  };
  visit(stepId);

  let input = 0;
  let output = 0;
  let hit = false;
  for (const item of items) {
    const { attribution } = item;
    if (attribution == null) {
      continue;
    }
    const matched = (attribution.parentId != null && subtreeIds.has(attribution.parentId)) || subtreeIds.has(attribution.id);
    if (matched) {
      input += item.usage.input;
      output += item.usage.output;
      hit = true;
    }
  }
  return hit ? { input, output } : null;
}

export function isApproximateUsageForStep(
  stepId: string,
  allSteps: readonly ReasoningStep[],
  items: readonly TokenUsageSnapshot[],
): boolean {
  if (items.length === 0) {
    return false;
  }
  const childrenByParent = new Map<string, string[]>();
  for (const step of allSteps) {
    if (step.parentStepId) {
      const list = childrenByParent.get(step.parentStepId) ?? [];
      list.push(step.stepId);
      childrenByParent.set(step.parentStepId, list);
    }
  }
  const subtreeIds = new Set<string>();
  const visit = (id: string): void => {
    if (subtreeIds.has(id)) {
      return;
    }
    subtreeIds.add(id);
    for (const child of childrenByParent.get(id) ?? []) {
      visit(child);
    }
  };
  visit(stepId);

  return items.some((item) => {
    const { attribution } = item;
    if (attribution == null) {
      return false;
    }
    const matched = (attribution.parentId != null && subtreeIds.has(attribution.parentId)) || subtreeIds.has(attribution.id);
    return matched && (item.accuracy !== "final" || item.terminal != null);
  });
}

export function readInsightReasoningSteps(insight: ChatMessageInsight | undefined): ReasoningStep[] {
  const treeSteps = insight?.reasoning?.steps;
  if (Array.isArray(treeSteps)) {
    return treeSteps;
  }
  const legacySteps = insight?.reasoningSteps;
  return Array.isArray(legacySteps) ? legacySteps : [];
}

export function readInsightToolEvents(insight: ChatMessageInsight | undefined): ToolEvent[] {
  const toolEvents = insight?.toolEvents;
  return Array.isArray(toolEvents) ? toolEvents : [];
}

export function resolveMessageInsight(input: {
  message: AssistantMessage;
  liveTurnUsage: TurnTokenUsage | null;
  activeTurnId: string | null;
  toolEvents: readonly ToolEvent[];
}): ChatMessageInsight | undefined {
  if (input.message.role !== "assistant") {
    return undefined;
  }
  const reasoning = hasVisibleReasoning(input.message.reasoning) ? input.message.reasoning : undefined;
  const reasoningSteps = reasoning?.steps ?? [];
  const messageToolEvents = input.message.turnId == null ? [] : input.toolEvents.filter((item) => item.turnId === input.message.turnId);
  const tokenUsage = pickMessageTokenUsage(input.message, input.liveTurnUsage, input.activeTurnId);
  if (reasoningSteps.length === 0 && messageToolEvents.length === 0 && tokenUsage == null) {
    return undefined;
  }
  return {
    ...(reasoning != null ? { reasoning } : {}),
    reasoningSteps,
    toolEvents: messageToolEvents,
    ...(tokenUsage != null ? { tokenUsage } : {}),
  };
}

export function formatToolEventPhase(event: ToolEvent): string {
  return event.phase === "completed" ? "完成" : "开始";
}

export function formatToolEventTime(event: ToolEvent): string {
  const timestamp = event.completedAt ?? event.startedAt;
  return new Date(timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatToolPreview(value: unknown): string {
  if (value == null) {
    return "";
  }
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 120 ? `${text.slice(0, 120)}...` : text;
}

export function formatToolPayload(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  try {
    const json = JSON.stringify(value, null, 2);
    return json == null ? String(value) : json;
  } catch {
    return String(value);
  }
}

export const KNOWLEDGE_TOOL_NAME = "platform.knowledge.query";
export const RUNTIME_SKILL_REFS_TOOL_NAME = "runtime.skill.refs";

export type StepActivity = ReturnType<typeof resolveStepActivity>;

export function stripLightThinkingMarkdown(text: string): string {
  return text
    .replace(/^\s{0,3}#{1,6}\s+/gmu, "")
    .replace(/\*\*(.+?)\*\*/gu, "$1")
    .replace(/`([^`]+)`/gu, "$1");
}

function countToolResultItems(output: unknown): number | null {
  if (Array.isArray(output)) {
    return output.length;
  }
  const record = asRecord(output);
  if (record == null) {
    return null;
  }
  for (const key of ["hits", "results", "items", "data", "documents", "matches", "chunks"]) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.length;
    }
  }
  return null;
}

export function resolveThinkingToolLabel(step: ReasoningStep): string {
  const exact = lookupExactToolLabel(step.toolName);
  if (exact !== undefined) {
    return exact;
  }

  switch (resolveStepActivity(step)) {
    case "web-search":
      return "联网搜索";
    case "knowledge-retrieval":
      return "知识库检索";
    case "skill-load":
      return "技能引用";
    default:
      return resolveToolDisplayLabel(step.toolName);
  }
}

function narrateToolCall(step: ReasoningStep): string | null {
  const activity = resolveStepActivity(step);
  const query = typeof step.args?.query === "string" ? step.args.query.trim() : "";
  const failed = step.ok === false;
  const done = step.ok !== undefined;

  if (activity === "knowledge-retrieval" || activity === "web-search") {
    const verb = activity === "knowledge-retrieval" ? "检索知识库" : "联网搜索";
    const base = query !== "" ? `${verb}：${query}` : verb;
    if (failed) {
      return `${base}（未成功）`;
    }
    if (done) {
      const hits = countToolResultItems(step.output);
      return hits !== null ? `${base}，命中 ${hits} 条` : base;
    }
    return base;
  }

  if (activity === "skill-load") {
    return failed ? "引用技能（未成功）" : "引用技能";
  }

  if (activity === "tool") {
    const label = resolveToolDisplayLabel(step.toolName);
    return failed ? `${label}（未成功）` : label;
  }

  return null;
}

function narrateStep(step: ReasoningStep): string | null {
  if (step.kind === "model-reasoning" || step.kind === "tool-loop") {
    const text = stripLightThinkingMarkdown(step.text).trim();
    return text !== "" ? text : null;
  }
  if (step.kind === "tool-call") {
    return narrateToolCall(step);
  }
  return null;
}

export interface ThinkingTimelineTool {
  key: string;
  label: string;
  activity: StepActivity;
  ok: boolean | undefined;
  step: ReasoningStep;
}

export interface ThinkingTimelineStep {
  key: string;
  narration: string;
  tools: ThinkingTimelineTool[];
  inProgress: boolean;
  startTime: number | undefined;
  endTime: number | undefined;
}

function toTimelineTool(step: ReasoningStep): ThinkingTimelineTool {
  return {
    key: step.stepId,
    label: resolveThinkingToolLabel(step),
    activity: resolveStepActivity(step),
    ok: step.ok,
    step,
  };
}

function toTimelineStep(step: ReasoningStep, narration: string, tools: ThinkingTimelineTool[]): ThinkingTimelineStep {
  return {
    key: step.stepId,
    narration,
    tools,
    inProgress: step.ok === undefined,
    startTime: typeof step.startTime === "number" && Number.isFinite(step.startTime) ? step.startTime : undefined,
    endTime: typeof step.endTime === "number" && Number.isFinite(step.endTime) ? step.endTime : undefined,
  };
}

export function buildThinkingSteps(steps: readonly ReasoningStep[]): ThinkingTimelineStep[] {
  const kindById = new Map<string, ReasoningStep["kind"]>();
  for (const step of steps) {
    kindById.set(step.stepId, step.kind);
  }

  const toolsByParent = new Map<string, ReasoningStep[]>();
  const reasoningByParent = new Map<string, ReasoningStep[]>();
  const groupInto = (map: Map<string, ReasoningStep[]>, key: string, step: ReasoningStep): void => {
    const list = map.get(key);
    if (list) {
      list.push(step);
    } else {
      map.set(key, [step]);
    }
  };

  for (const step of steps) {
    if (step.kind === "tool-call") {
      groupInto(toolsByParent, step.parentStepId ?? "", step);
    } else if (step.kind === "model-reasoning") {
      groupInto(reasoningByParent, step.parentStepId ?? "", step);
    }
  }

  type TimelineEntry = { item: ThinkingTimelineStep; order: number; startTime: number | undefined };
  const entries: TimelineEntry[] = [];
  const claimedTools = new Set<string>();
  const claimTools = (stepId: string): ThinkingTimelineTool[] => {
    const tools = toolsByParent.get(stepId) ?? [];
    for (const tool of tools) {
      claimedTools.add(tool.stepId);
    }
    return tools.map(toTimelineTool);
  };

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    const parentIsToolLoop = step.parentStepId !== undefined && kindById.get(step.parentStepId) === "tool-loop";
    const isTimelineStep = step.kind === "tool-loop" || (step.kind === "model-reasoning" && !parentIsToolLoop);
    if (!isTimelineStep) {
      continue;
    }

    const parts: string[] = [];
    const ownText = narrateStep(step);
    if (ownText !== null && ownText !== "") {
      parts.push(ownText);
    }
    if (step.kind === "tool-loop") {
      for (const child of reasoningByParent.get(step.stepId) ?? []) {
        const childText = narrateStep(child);
        if (childText !== null && childText !== "") {
          parts.push(childText);
        }
      }
    }

    const narration = parts.join("\n");
    const tools = claimTools(step.stepId);
    if (narration === "" && tools.length === 0) {
      continue;
    }
    const item = toTimelineStep(step, narration, tools);
    entries.push({ item, order: i, startTime: item.startTime });
  }

  // 兜底：未认领的 tool-call 按 startTime（缺省则按 steps 原序）插入，避免永远钉在末尾。
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    if (step.kind === "tool-call" && !claimedTools.has(step.stepId)) {
      const item = toTimelineStep(step, "", [toTimelineTool(step)]);
      entries.push({ item, order: i, startTime: item.startTime });
    }
  }

  entries.sort((a, b) => {
    if (typeof a.startTime === "number" && typeof b.startTime === "number" && a.startTime !== b.startTime) {
      return a.startTime - b.startTime;
    }
    return a.order - b.order;
  });

  return entries.map((entry) => entry.item);
}

export function computeThinkingElapsedMs(steps: readonly ReasoningStep[], nowMs: number, streaming: boolean): number {
  let start = Number.POSITIVE_INFINITY;
  let end = 0;
  for (const step of steps) {
    if (typeof step.startTime === "number" && Number.isFinite(step.startTime)) {
      start = Math.min(start, step.startTime);
    }
    const stepEnd =
      step.ok === undefined ? nowMs : typeof step.endTime === "number" && Number.isFinite(step.endTime) ? step.endTime : nowMs;
    end = Math.max(end, stepEnd);
  }
  if (!Number.isFinite(start)) {
    return 0;
  }
  return Math.max(0, (streaming ? Math.max(end, nowMs) : end) - start);
}

export function formatThinkingDoneLabel(elapsed: string): string {
  return elapsed !== "" ? `已思考 ${elapsed}` : "思考过程";
}

export function isKnowledgeRetrievalStep(step: ReasoningStep): boolean {
  return reasoningToolName(step) === KNOWLEDGE_TOOL_NAME || resolveStepActivity(step) === "knowledge-retrieval";
}

export function isSkillReferenceStep(step: ReasoningStep): boolean {
  return reasoningToolName(step) === RUNTIME_SKILL_REFS_TOOL_NAME || resolveStepActivity(step) === "skill-load";
}

export interface KnowledgeHitSummary {
  title: string;
  snippet: string;
  kbId?: string;
  score?: number;
  link?: string;
}

export interface SkillRefSummary {
  skillId: string;
  displayName?: string;
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function readStringField(value: Record<string, unknown>, key: string): string | undefined {
  const raw = value[key];
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
}

export function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim() !== "").map((item) => item.trim())
    : [];
}

export function readKnowledgeHits(output: unknown): KnowledgeHitSummary[] {
  const record = asRecord(output);
  const hits = record?.hits;
  if (!Array.isArray(hits)) {
    return [];
  }
  return hits
    .map((item): KnowledgeHitSummary | null => {
      const hit = asRecord(item);
      if (hit == null) {
        return null;
      }
      const snippet = readStringField(hit, "snippet") ?? readStringField(hit, "content") ?? readStringField(hit, "text");
      if (snippet == null) {
        return null;
      }
      const { score } = hit;
      const kbId = readStringField(hit, "kbId");
      const link = readStringField(hit, "link");
      return {
        title: readStringField(hit, "title") ?? readStringField(hit, "docId") ?? "知识片段",
        snippet,
        ...(kbId !== undefined ? { kbId } : {}),
        ...(typeof score === "number" && Number.isFinite(score) ? { score } : {}),
        ...(link !== undefined ? { link } : {}),
      };
    })
    .filter((item): item is KnowledgeHitSummary => item != null);
}

export function readSkillRefs(output: unknown, args: Record<string, unknown> | undefined): SkillRefSummary[] {
  const record = asRecord(output);
  const skills = record?.skills ?? record?.skillRefs ?? record?.refs;
  if (Array.isArray(skills)) {
    return skills
      .map((item): SkillRefSummary | null => {
        if (typeof item === "string" && item.trim() !== "") {
          return { skillId: item.trim() };
        }
        const skill = asRecord(item);
        if (skill == null) {
          return null;
        }
        const skillId = readStringField(skill, "skillId") ?? readStringField(skill, "id") ?? readStringField(skill, "name");
        if (skillId == null) {
          return null;
        }
        const displayName = readStringField(skill, "displayName") ?? readStringField(skill, "title") ?? readStringField(skill, "label");
        return {
          skillId,
          ...(displayName !== undefined ? { displayName } : {}),
        };
      })
      .filter((item): item is SkillRefSummary => item != null);
  }
  const argRefs = readStringArray(args?.skillIds);
  if (argRefs.length > 0) {
    return argRefs.map((skillId) => ({ skillId }));
  }
  return readStringArray(args?.skills).map((skillId) => ({ skillId }));
}

export function reasoningToolName(step: ReasoningStep): string {
  return step.toolName ?? step.label.replace(/^调用\s+/, "");
}

export function reasoningStepLabel(step: ReasoningStep): string {
  if (step.kind === "tool-call") {
    return resolveThinkingToolLabel(step);
  }
  return step.label;
}

export function hasObjectEntries(value: Record<string, unknown> | undefined): boolean {
  return value != null && Object.keys(value).length > 0;
}
