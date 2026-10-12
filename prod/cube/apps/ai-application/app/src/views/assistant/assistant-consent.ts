/**
 * 纯逻辑辅助函数 — Agentic Engine 用户授权（Consent）流程。
 * 无副作用，便于单元测试。
 */

/** 将引擎推荐的 scopeHint 映射为 UI 预选项；缺省使用最安全的 SESSION。 */
export function mapScopeHintToChoice(hint?: "ONCE" | "PERSISTENT"): "ONCE" | "SESSION" | "PERSISTENT" {
  if (hint === "ONCE") return "ONCE";
  if (hint === "PERSISTENT") return "PERSISTENT";
  return "SESSION";
}

/** 授权请求是否已超过截止时间（epoch ms）。 */
export function isGrantExpired(expiresTime: number, now: number): boolean {
  return now >= expiresTime;
}

/** 距截止时间剩余的完整秒数（最小为 0）。 */
export function remainingSeconds(expiresTime: number, now: number): number {
  return Math.max(0, Math.floor((expiresTime - now) / 1000));
}

/** 参数预览是否包含实质内容（引擎当前版本可能返回空对象 {}）。 */
export function hasArgsPreview(argsPreview?: unknown): boolean {
  if (argsPreview === undefined || argsPreview === null) return false;
  if (typeof argsPreview !== "object") return false;
  return Object.keys(argsPreview as object).length > 0;
}
