export function queryText(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return queryText(value[0]);
  }
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export function readQueryText(routeValue: unknown, key: string): string | undefined {
  return queryText(routeValue) ?? queryText(new URLSearchParams(window.location.search).get(key));
}
