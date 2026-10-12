/** 与模型管理 / 流程编辑器下拉一致：无模型自定义图标时的占位 */
export const FLOW_EDITOR_MODEL_ICON_FALLBACK = "/resource/v1/ai-application/getModel.png";

/** 未选具体模型时画布上的通用「语言模型」图标 */
export const LLM_NODE_DEFAULT_CANVAS_ICON = "/resource/v1/ai-application/llm.png";

/** 由租户模型 `iconUrl` 解析为可展示的 URL（空则占位图，非 llm 通用图） */
export function iconSrcFromModelIconUrl(iconUrl: string | null | undefined): string {
  const raw = iconUrl?.trim();
  return raw !== "" && raw != null ? raw : FLOW_EDITOR_MODEL_ICON_FALLBACK;
}

/**
 * 灰色模型条（modelArea）内、模型文案左侧小图：与右侧面板一致，用 `selectedModelIconUrl`；未选模型时用通用占位图。
 * 注意：节点标题行左侧大图标始终用 `LLM_NODE_DEFAULT_CANVAS_ICON`，勿与此混用。
 */
export function languageModelRowIconHref(config: Record<string, unknown>): string {
  const stored = typeof config.selectedModelIconUrl === "string" ? config.selectedModelIconUrl.trim() : "";
  if (stored !== "") {
    return stored;
  }
  return FLOW_EDITOR_MODEL_ICON_FALLBACK;
}
