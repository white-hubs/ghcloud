import type { LibraryItemView, ShelfEntryView } from "@cube-ai/contracts";

import { isEngineInternalLibraryRef } from "../../utils/engine-internal-catalog";

export interface AssistantAgentOption {
  id: string;
  name: string;
  description: string;
  /** 自定义头像 URL；缺省时聊天侧用默认图标 */
  avatarUrl?: string;
  /** 货架来源；聊天侧据此决定是否需要拉 getAgent 详情 */
  source?: "ref" | "authored";
}

/** 平台内置系统智能体（19 位 SFID）展示名；货架/库未带 displayName 时回落。 */
export const SYSTEM_AGENT_DISPLAY_NAMES: Readonly<Record<string, string>> = {
  "1934000000000000001": "安全智能体",
  "1934000000000000002": "孪生智能体",
  "1934000000000000003": "业务数据分析",
};

/** 平台内置系统智能体简介（货架/库未带 description 时回落）。 */
export const SYSTEM_ASSISTANT_AGENTS: readonly AssistantAgentOption[] = [
  {
    id: "1934000000000000001",
    name: SYSTEM_AGENT_DISPLAY_NAMES["1934000000000000001"]!,
    description: "聚焦安全规范、风险识别和事件处置建议。",
  },
  {
    id: "1934000000000000002",
    name: SYSTEM_AGENT_DISPLAY_NAMES["1934000000000000002"]!,
    description: "面向数字孪生与复杂推演场景。",
  },
  {
    id: "1934000000000000003",
    name: SYSTEM_AGENT_DISPLAY_NAMES["1934000000000000003"]!,
    description: "通过 MCP 工具查询业务数据库回答数据分析问题。",
  },
];

export function resolveAssistantAgentDisplayName(
  entry: Pick<ShelfEntryView, "targetId" | "displayName">,
  libraryByRef?: Map<string, Pick<LibraryItemView, "displayName">>,
): string {
  const shelfName = entry.displayName?.trim();
  if (shelfName && shelfName !== entry.targetId) {
    return shelfName;
  }
  const libraryName = libraryByRef?.get(entry.targetId)?.displayName?.trim();
  if (libraryName) {
    return libraryName;
  }
  return SYSTEM_AGENT_DISPLAY_NAMES[entry.targetId] ?? shelfName ?? entry.targetId;
}

/**
 * 对话可选智能体仅来自「我的智能体」货架（runnable）。
 *
 * 货架列表接口（GET /my/agents）是基础列表来源；若货架缺少简介，
 * `useAssistantAgentOptions` 会再从 descriptor / library 详情补齐。
 * 会话创建（session）只透传 agentId，prompt/skillRefs 由引擎按 id 解析。
 *
 * runnableStatus 已由服务端综合 enabled + 版本可解析性给出：
 * ref 条目若库已下架且无 pin，会是 "unresolvable"；停用条目是 "disabled"。
 * 过滤 runnable 即可，无需前端再用库查询做二次「孤儿」判定。
 *
 * 系统级智能体若货架 displayName 缺失或等于 id，则回落库 catalog / 内置展示名。
 */
export function buildAssistantAgentOptionsFromShelf(
  agentShelf: ShelfEntryView[],
  libraryByRef?: Map<string, Pick<LibraryItemView, "displayName">>,
): AssistantAgentOption[] {
  const options: AssistantAgentOption[] = [];
  const existingIds = new Set<string>();

  for (const entry of agentShelf) {
    if (entry.targetKind !== "agent" || entry.runnableStatus !== "runnable") {
      continue;
    }
    if (isEngineInternalLibraryRef("agent", entry.targetId)) {
      continue;
    }
    if (existingIds.has(entry.targetId)) {
      continue;
    }
    options.push({
      id: entry.targetId,
      name: resolveAssistantAgentDisplayName(entry, libraryByRef),
      description: "",
      source: entry.source === "ref" ? "ref" : "authored",
    });
    existingIds.add(entry.targetId);
  }

  return options;
}
