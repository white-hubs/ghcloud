import type { LlmOption } from "@cube-ai/agent-sdk-client-vue";

import { matchesSearchText } from "./assistant-search";

export interface LlmOptionGroup {
  providerName: string;
  items: LlmOption[];
}

function matchesLlmOption(option: LlmOption, normalizedQuery: string): boolean {
  if (!normalizedQuery) {
    return true;
  }
  return matchesSearchText([option.displayName, option.modelCode, option.providerName], normalizedQuery);
}

export function groupVisibleLlmOptions(options: LlmOption[], query: string): LlmOptionGroup[] {
  const normalizedQuery = query.trim().toLowerCase();
  const map = new Map<string, LlmOption[]>();
  for (const option of options) {
    if (!matchesLlmOption(option, normalizedQuery)) {
      continue;
    }
    const key = option.providerName || "其它";
    const list = map.get(key) ?? [];
    list.push(option);
    map.set(key, list);
  }
  return [...map.entries()].map(([providerName, items]) => ({ providerName, items }));
}
