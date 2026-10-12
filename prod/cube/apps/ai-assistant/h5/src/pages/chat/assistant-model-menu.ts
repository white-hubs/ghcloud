import type { LlmOption } from "@cube-ai/agent-sdk-client-vue";

export interface LlmOptionGroup {
  providerName: string;
  items: LlmOption[];
}

function normalizeSearchPart(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\s_\-./|·:：()[\]（）]+/g, "");
}

function matchesSearchText(values: ReadonlyArray<string | null | undefined>, query: string): boolean {
  const normalizedQuery = normalizeSearchPart(query);
  if (normalizedQuery === "") {
    return true;
  }
  return values.some((value) => value != null && normalizeSearchPart(value).includes(normalizedQuery));
}

function matchesLlmOption(option: LlmOption, query: string): boolean {
  return matchesSearchText([option.displayName, option.modelCode, option.providerName], query);
}

export function groupVisibleLlmOptions(options: readonly LlmOption[], query: string): LlmOptionGroup[] {
  const map = new Map<string, LlmOption[]>();
  for (const option of options) {
    if (!matchesLlmOption(option, query)) {
      continue;
    }
    const key = option.providerName || "其它";
    const list = map.get(key) ?? [];
    list.push(option);
    map.set(key, list);
  }
  return [...map.entries()].map(([providerName, items]) => ({ providerName, items }));
}
