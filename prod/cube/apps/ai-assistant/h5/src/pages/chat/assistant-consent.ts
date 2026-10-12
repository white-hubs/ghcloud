export type GrantScopeChoice = "ONCE" | "SESSION" | "PERSISTENT";

/** 将引擎推荐的授权范围映射为 H5 默认选项；缺省用会话级，避免误永久授权。 */
export function mapScopeHintToChoice(hint?: GrantScopeChoice): GrantScopeChoice {
  if (hint === "ONCE" || hint === "PERSISTENT") {
    return hint;
  }
  return "SESSION";
}

export function remainingSeconds(expiresTime: number, now: number): number {
  return Math.max(0, Math.floor((expiresTime - now) / 1000));
}

export function isGrantExpired(expiresTime: number, now: number): boolean {
  return now >= expiresTime;
}

export function hasArgsPreview(argsPreview?: unknown): boolean {
  if (argsPreview == null || typeof argsPreview !== "object") {
    return false;
  }
  return Object.keys(argsPreview).length > 0;
}
