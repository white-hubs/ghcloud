import type { FetchItem } from "../contracts/types";

export function isSubstantiveItem(item: FetchItem): boolean {
  const title = item.title?.trim() ?? "";
  const content = item.content?.trim() ?? "";
  const url = item.url?.trim() ?? "";
  return title.length > 0 || content.length > 0 || url.length > 0;
}

export function applyLimit(
  items: FetchItem[],
  limit: number,
): {
  items: FetchItem[];
  totalMatched: number;
} {
  const substantive = items.filter(isSubstantiveItem);
  return {
    totalMatched: substantive.length,
    items: substantive.slice(0, limit),
  };
}
