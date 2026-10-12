const FRONTMATTER_DELIMITER = "---";

interface ParsedYamlEntry {
  key: string;
  value: string;
  children: string[];
}

const PREFERRED_KEY_ORDER = ["name", "displayName", "description", "version", "activation", "tags", "resources"];

function isTopLevelKey(line: string): boolean {
  return /^[A-Za-z_][\w-]*\s*:/.test(line);
}

/** 去掉整段 frontmatter 被统一多缩进的情况（粘贴时常见），保留字段间的相对缩进。 */
function dedentFrontmatter(yaml: string): string {
  const lines = yaml.split("\n");
  const indents = lines.filter((line) => line.trim().length > 0).map((line) => /^\s*/.exec(line)?.[0].length ?? 0);
  const minIndent = indents.length > 0 ? Math.min(...indents) : 0;
  if (minIndent === 0) {
    return yaml;
  }
  return lines.map((line) => (line.trim().length === 0 ? line : line.slice(minIndent))).join("\n");
}

/** 合并被硬换行的 scalar 续行；仅在 ASCII 词边界补空格，CJK 之间不补，避免破坏原文。 */
function joinContinuation(base: string, next: string): string {
  const needsSpace = /[A-Za-z0-9,.;:]$/.test(base) && /^[A-Za-z0-9]/.test(next);
  return needsSpace ? `${base} ${next}` : `${base}${next}`;
}

function splitFrontmatter(source: string): { yaml: string; body: string; lineEnding: string } | null {
  const lineEnding = source.includes("\r\n") ? "\r\n" : "\n";
  const lines = source.replaceAll("\r\n", "\n").split("\n");
  if (lines[0]?.trim() !== FRONTMATTER_DELIMITER) {
    return null;
  }

  const endIndex = lines.findIndex((line, index) => index > 0 && line.trim() === FRONTMATTER_DELIMITER);
  if (endIndex < 0) {
    return null;
  }

  return {
    yaml: lines.slice(1, endIndex).join("\n"),
    body: lines.slice(endIndex + 1).join("\n"),
    lineEnding,
  };
}

function parseYamlEntries(yaml: string): ParsedYamlEntry[] {
  const entries: ParsedYamlEntry[] = [];
  let current: ParsedYamlEntry | null = null;

  for (const rawLine of dedentFrontmatter(yaml).split("\n")) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      continue;
    }

    if (current?.key === "activation" && /^(mode|globs)\s*:/.test(line)) {
      current.children.push(line.trim());
      continue;
    }

    if (isTopLevelKey(line)) {
      const colonIndex = line.indexOf(":");
      current = {
        key: line.slice(0, colonIndex).trim(),
        value: line.slice(colonIndex + 1).trim(),
        children: [],
      };
      entries.push(current);
      continue;
    }

    if (current == null) {
      continue;
    }

    if (/^\s+/.test(line) || line.trimStart().startsWith("- ")) {
      current.children.push(line.trim());
    } else if (current.value) {
      // 修复从文本框粘贴后被硬换行的简单 scalar（如 description）。
      current.value = joinContinuation(current.value, line.trim());
    } else {
      current.value = line.trim();
    }
  }

  return entries;
}

function compareEntries(a: ParsedYamlEntry, b: ParsedYamlEntry): number {
  const ai = PREFERRED_KEY_ORDER.indexOf(a.key);
  const bi = PREFERRED_KEY_ORDER.indexOf(b.key);
  if (ai >= 0 && bi >= 0) {
    return ai - bi;
  }
  if (ai >= 0) {
    return -1;
  }
  if (bi >= 0) {
    return 1;
  }
  return 0;
}

function formatEntry(entry: ParsedYamlEntry): string[] {
  if (entry.children.length === 0) {
    return [`${entry.key}:${entry.value ? ` ${entry.value}` : ""}`];
  }

  return [
    `${entry.key}:${entry.value ? ` ${entry.value}` : ""}`,
    ...entry.children.map((child) => (child.startsWith("- ") ? `  ${child}` : `  ${child}`)),
  ];
}

function rebuildFrontmatter(parsed: { yaml: string; body: string; lineEnding: string }, entries: ParsedYamlEntry[]): string {
  const formattedYaml = entries.toSorted(compareEntries).flatMap(formatEntry).join("\n");
  return [FRONTMATTER_DELIMITER, formattedYaml, FRONTMATTER_DELIMITER, parsed.body].join(parsed.lineEnding);
}

/** 判断文档是否包含可解析的 `--- ... ---` frontmatter（用于区分“无头部”与“已规范”）。 */
export function hasDescriptorFrontmatter(source: string): boolean {
  const parsed = splitFrontmatter(source);
  if (parsed == null) {
    return false;
  }
  return parseYamlEntries(parsed.yaml).length > 0;
}

export function formatDescriptorDocumentFrontmatter(source: string): string {
  const parsed = splitFrontmatter(source);
  if (parsed == null) {
    return source;
  }

  const entries = parseYamlEntries(parsed.yaml);
  if (entries.length === 0) {
    return source;
  }

  return rebuildFrontmatter(parsed, entries);
}

/** 服务端 descriptor `name` 的 fail-closed 校验正则（ADR-0033）：小写 kebab、ASCII、无前导/尾随/连续连字符。 */
export const DESCRIPTOR_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidDescriptorName(name: string): boolean {
  return DESCRIPTOR_NAME_PATTERN.test(name);
}

/** 把任意字符串折成合法 slug；中文等全部落空时兜底为 "descriptor"，需要用户确认/改名。 */
export function slugifyDescriptorName(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
  return slug || "descriptor";
}

/** 读取 frontmatter 顶层 `name` 字段原始值（未做 slug 校验）；无 frontmatter 或无 name 时返回 null。 */
export function extractDescriptorName(source: string): string | null {
  const parsed = splitFrontmatter(source);
  if (parsed == null) {
    return null;
  }
  const nameEntry = parseYamlEntries(parsed.yaml).find((entry) => entry.key === "name");
  const value = nameEntry?.value.trim();
  return value ? value : null;
}

/**
 * 若 frontmatter `name` 非法 slug（中文/大写/空格/边缘连字符等），就地替换为 `slugifyDescriptorName` 结果；
 * `name` 缺失或已合法时原样返回。用于 `:fromDocument` 导入前的批量规整，避免 400。
 */
export function normalizeDescriptorNameSlug(source: string): string {
  const parsed = splitFrontmatter(source);
  if (parsed == null) {
    return source;
  }
  const entries = parseYamlEntries(parsed.yaml);
  const nameEntry = entries.find((entry) => entry.key === "name");
  if (!nameEntry?.value.trim() || isValidDescriptorName(nameEntry.value.trim())) {
    return source;
  }
  nameEntry.value = slugifyDescriptorName(nameEntry.value);
  return rebuildFrontmatter(parsed, entries);
}
