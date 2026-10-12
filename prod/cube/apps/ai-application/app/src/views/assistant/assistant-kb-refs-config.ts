/**
 * 聊天 composer 手动知识库引入开关。
 * 默认关闭（隐藏 KB pill / @ 引用）；智能体绑定 KB 的静默注入不受此开关影响。
 */
export function isAssistantKbRefsUiEnabled(): boolean {
  const raw = import.meta.env.VITE_ASSISTANT_KB_REFS_UI_ENABLED;
  if (raw == null || String(raw).trim() === "") {
    return false;
  }
  const normalized = String(raw).trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

/** 草稿/发送时过滤用户手动选择的 KB 引用（开关关闭时）。 */
export function filterManualComposerReferences<T extends { type: string }>(refs: readonly T[]): T[] {
  if (isAssistantKbRefsUiEnabled()) {
    return [...refs];
  }
  return refs.filter((ref) => ref.type !== "kb");
}
