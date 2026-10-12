/**
 * 解析 AI 环游指令目标状态。
 * - true / "true" / "on" / "开启" → 开启
 * - false / "false" / "off" / "关闭" → 关闭
 * - 缺省 → 开启（「开启环游」语义；已开启时再发不会 flip 关掉）
 */
export function resolveTourAroundDesired(raw: unknown): boolean {
  if (raw == null) {
    return true;
  }
  if (typeof raw === "boolean") {
    return raw;
  }
  if (typeof raw === "number") {
    return raw !== 0;
  }

  let candidate: unknown = raw;
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    candidate = obj.value ?? obj.enabled ?? obj.open ?? obj.status ?? obj.on;
  }

  if (typeof candidate === "boolean") {
    return candidate;
  }
  if (typeof candidate === "number") {
    return candidate !== 0;
  }
  if (typeof candidate !== "string") {
    return true;
  }

  const text = candidate.trim().toLowerCase();
  if (!text) {
    return true;
  }
  if (["false", "0", "off", "close", "关闭", "退出", "停止", "停"].includes(text)) {
    return false;
  }
  if (["true", "1", "on", "open", "开启", "打开", "开始", "启动"].includes(text)) {
    return true;
  }
  return true;
}
