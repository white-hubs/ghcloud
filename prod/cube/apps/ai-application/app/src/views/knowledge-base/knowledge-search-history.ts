const SEARCH_HISTORY_KEY = "ai-application:knowledge-base:search-history";
const SEARCH_HISTORY_LIMIT = 8;

export function readSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, SEARCH_HISTORY_LIMIT);
  } catch {
    return [];
  }
}

export function pushSearchHistory(value: string, current: string[] = readSearchHistory()): string[] {
  const keyword = value.trim();
  if (!keyword) {
    return current;
  }
  const next = [keyword, ...current.filter((item) => item !== keyword)].slice(0, SEARCH_HISTORY_LIMIT);
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / private mode
  }
  return next;
}
