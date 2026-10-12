import type { LlmOption } from "@cube-ai/agent-sdk-client-assistant";

import { cubeAiApplicationService } from "./service";

/**
 * 助手 / 智能体调试共用的租户对话模型列表。
 * 对 `listTenantModels()` 做防御性扁平化（兼容 group 形态透传）。
 */
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
    (r) =>
      r != null &&
      typeof r === "object" &&
      Array.isArray((r as GroupedShape).items) &&
      ((r as FlatShape).modelCode == null || (r as FlatShape).modelCode === ""),
  );
}

function isEmbeddingModel(m: { endpointType?: string | null; modelTypes?: string[] | null }): boolean {
  const et = (m.endpointType ?? "").trim().toLowerCase();
  if (et === "embedding") {
    return true;
  }
  return (m.modelTypes ?? []).some((t) => String(t).toLowerCase() === "embedding");
}

export async function fetchAssistantLlmOptions(logTag = "assistant-llm-options"): Promise<LlmOption[]> {
  const raw = await cubeAiApplicationService.listTenantModels();
  const rows: unknown[] = Array.isArray(raw) ? raw : [];

  const flat: FlatShape[] = [];
  if (isGroupedShape(rows)) {
    for (const group of rows) {
      const groupName = group.groupName ?? "";
      for (const item of group.items ?? []) {
        flat.push({ ...item, providerName: item.providerName ?? groupName });
      }
    }
  } else {
    flat.push(...(rows as FlatShape[]));
  }

  const options = flat
    .filter((m) => !isEmbeddingModel(m) && typeof m.modelCode === "string" && m.modelCode !== "")
    .map((m) => ({
      modelCode: String(m.modelCode),
      displayName: m.displayName && String(m.displayName).trim() ? String(m.displayName) : String(m.modelCode),
      providerName: m.providerName ?? "",
    }));

  if (options.length === 0) {
    // eslint-disable-next-line no-console
    console.warn(`[${logTag}] listTenantModels 返回 0 个可用对话模型；原始 rows =`, rows);
  }
  return options;
}

export function pickDefaultLlmModelCode(options: readonly LlmOption[]): string {
  return options[0]?.modelCode?.trim() ?? "";
}
