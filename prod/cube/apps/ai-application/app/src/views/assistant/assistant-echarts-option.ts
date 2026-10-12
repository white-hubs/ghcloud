export type EchartsOptionParseResult = { ok: true; option: Record<string, unknown> } | { ok: false; message: string };

const BLOCKED_OPTION_KEYS = new Set(["formatter", "colorFormatter", "animationDurationUpdate"]);

function stripBlockedOptionKeys(value: unknown): unknown {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripBlockedOptionKeys(item));
  }

  const record = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(record)) {
    if (BLOCKED_OPTION_KEYS.has(key)) {
      continue;
    }
    next[key] = stripBlockedOptionKeys(child);
  }
  return next;
}

/** 解析并净化助手回复中的 ECharts option JSON（移除 formatter 等不安全配置键） */
export function parseEchartsOption(source: string): EchartsOptionParseResult {
  const trimmed = source.trim();
  if (trimmed === "") {
    return { ok: false, message: "ECharts 配置为空" };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed) as unknown;
  } catch {
    return { ok: false, message: "ECharts 配置不是合法 JSON" };
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, message: "ECharts 配置必须是 JSON 对象" };
  }
  return { ok: true, option: stripBlockedOptionKeys(parsed) as Record<string, unknown> };
}
