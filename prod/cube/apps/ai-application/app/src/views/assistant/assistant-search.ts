import PinyinMatch from "pinyin-match";

function normalizeSearchPart(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\s_\-./|·:：()[\]（）]+/g, "");
}

function matchesValue(value: string, normalizedQuery: string): boolean {
  const normalizedValue = normalizeSearchPart(value);
  if (normalizedValue.includes(normalizedQuery)) {
    return true;
  }
  return PinyinMatch.match(value.normalize("NFKC"), normalizedQuery) !== false;
}

export function matchesSearchText(values: ReadonlyArray<string | null | undefined>, query: string): boolean {
  const normalizedQuery = normalizeSearchPart(query);
  if (normalizedQuery === "") {
    return true;
  }
  return values.some((value) => value != null && value !== "" && matchesValue(value, normalizedQuery));
}
