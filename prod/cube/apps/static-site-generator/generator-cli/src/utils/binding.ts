export function resolveBinding(value: string, data: Record<string, any>): string | any[] {
  if (typeof value !== "string") return value;
  const pattern = /^\$\{([\w.]+)\}$/;
  const exactMatch = value.match(pattern);
  if (exactMatch) {
    const key = exactMatch[1];
    if (data[key] !== undefined) {
      return data[key];
    }
  }

  const replacePattern = /\$\{([\w.]+(?:\[\d+\])?)\}/g;
  return value.replace(replacePattern, (_, path) => {
    const match = path.match(/^([\w.]+)\[(\d+)\]\.(.+)$/);
    if (match) {
      const [, arrayKey, index, rest] = match;
      const arr = data[arrayKey];
      return arr?.[parseInt(index)]?.[rest] ?? "";
    }

    const simpleArrayMatch = path.match(/^([\w.]+)\[(\d+)\]$/);
    if (simpleArrayMatch) {
      const [, arrayKey, index] = simpleArrayMatch;
      return data[arrayKey]?.[parseInt(index)] ?? "";
    }

    const keys = path.split(".");
    let result = data;
    for (const key of keys) {
      result = result?.[key];
    }
    return result ?? "";
  });
}

export function resolveProps(props: Record<string, any>, data: Record<string, any>): Record<string, any> {
  if (!props) return {};
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    if (typeof value === "string" && value.includes("${")) {
      result[key] = resolveBinding(value, data);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => (typeof item === "object" && item !== null ? resolveProps(item, data) : item));
    } else if (typeof value === "object" && value !== null) {
      if (value.$ref && typeof value.$ref === "string") {
        const ref = value.$ref;
        if (ref === "./articles/index.json" || ref.startsWith("./articles/page-")) {
          result[key] = Array.isArray(data.articles) ? data.articles : [];
        } else if (ref === "./articles/news-categories.json") {
          result[key] = Array.isArray(data.articleCategories) ? data.articleCategories : [];
        } else {
          result[key] = resolveProps(value, data);
        }
      } else {
        result[key] = resolveProps(value, data);
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}
