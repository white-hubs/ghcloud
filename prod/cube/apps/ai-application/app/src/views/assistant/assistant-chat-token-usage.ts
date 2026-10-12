/**
 * AI 助手聊天面板 token 用量纯函数集（从 `assistant-chat.tsx` 抽离）。
 *
 * 抽离原因：
 *   1. 与 Vue / JSX / less module 解耦，可在 `bun:test` 直接跑单测。
 *   2. 把"消息显示哪份 tokenUsage / 单 reasoning step 聚合"等业务规则集中到一处，
 *      避免散落在组件里随手改字段名（spec 要求按 `attribution.parentId === step.stepId`
 *      关联，组件早期实现误用 `attribution.id`，导致子 step 一律不显示 token；
 *      ref: cube-agentic-engine/docs/superpowers/specs/2026-05-15-realtime-token-usage-design.md §UI）。
 */
import type {
  AssistantMessage,
  PersistedTokenUsage,
  ReasoningStep,
  TokenUsageSnapshot,
  TokenUsageTriplet,
  TurnTokenUsage,
} from "@cube-ai/agent-sdk-client-vue";

export interface ResolvedMessageTokenUsage {
  cumulative: TokenUsageTriplet;
  items: TokenUsageSnapshot[];
  terminalKind?: PersistedTokenUsage["terminalKind"];
}

/**
 * 选择该 message 应显示的 tokenUsage 视图：
 *   - 已归档（终结后写入 message.tokenUsage 或 IDB 回填）→ 用归档值
 *   - 当前流式中且 turnId 与 active turn 一致 → 用 live `tokenUsageBySessionId`
 *   - 否则不显示
 */
export function pickMessageTokenUsage(
  message: AssistantMessage,
  liveTurnUsage: TurnTokenUsage | null,
  activeTurnId: string | null,
): ResolvedMessageTokenUsage | null {
  if (message.tokenUsage) {
    return message.tokenUsage;
  }
  if (
    liveTurnUsage != null &&
    activeTurnId != null &&
    message.turnId != null &&
    message.turnId === activeTurnId &&
    liveTurnUsage.turnId === activeTurnId
  ) {
    return { cumulative: liveTurnUsage.cumulative, items: liveTurnUsage.items };
  }
  return null;
}

/**
 * 聚合一个 reasoning step（含其所有后代）的 token：
 *   - 从 `stepId` 出发 DFS 收集子树所有 stepId
 *   - 命中条件遵循 spec §UI："Join usage attribution to ReasoningTreeView by
 *     `attribution.parentId === step.stepId`"
 *     —— 一个 step（lifecycle / tool-loop）内可有多次独立 LLM call（如 turnStart
 *     的 fallback-summary + final-answer），每次 LLM call 自己有唯一的
 *     `attribution.id`，其归属通过 `attribution.parentId` 指向所在 step。
 *   - 兜底也接受 `attribution.id ∈ subtree`（极少数将来可能直接挂 step 自身的场景）。
 *   - 完全不命中返回 null（调用方据此跳过 UI 渲染）。
 */
export function aggregateUsageForStep(
  stepId: string,
  allSteps: ReasoningStep[],
  items: TokenUsageSnapshot[],
): { input: number; output: number } | null {
  if (items.length === 0) {
    return null;
  }
  const childrenByParent = new Map<string, string[]>();
  for (const s of allSteps) {
    if (s.parentStepId) {
      const list = childrenByParent.get(s.parentStepId) ?? [];
      list.push(s.stepId);
      childrenByParent.set(s.parentStepId, list);
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
  for (const it of items) {
    const { attribution } = it;
    if (attribution == null) {
      continue;
    }
    const { parentId } = attribution;
    const matched = (parentId != null && subtreeIds.has(parentId)) || subtreeIds.has(attribution.id);
    if (matched) {
      input += it.usage.input;
      output += it.usage.output;
      hit = true;
    }
  }
  return hit ? { input, output } : null;
}

export function isApproximateUsageForStep(stepId: string, allSteps: ReasoningStep[], items: TokenUsageSnapshot[]): boolean {
  if (items.length === 0) {
    return false;
  }
  const childrenByParent = new Map<string, string[]>();
  for (const s of allSteps) {
    if (s.parentStepId) {
      const list = childrenByParent.get(s.parentStepId) ?? [];
      list.push(s.stepId);
      childrenByParent.set(s.parentStepId, list);
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
  return items.some((it) => {
    const { attribution } = it;
    if (attribution == null) {
      return false;
    }
    const { parentId } = attribution;
    const matched = (parentId != null && subtreeIds.has(parentId)) || subtreeIds.has(attribution.id);
    return matched && (it.accuracy !== "final" || it.terminal != null);
  });
}

export function isApproximateTokenUsage(usage: ResolvedMessageTokenUsage): boolean {
  return usage.items.some((item) => item.accuracy !== "final" || item.terminal != null);
}

export { formatTokenInline, terminalKindBadge } from "./assistant-chat-strings";
