/** Universal-panel V2 shell class stack (科技蓝 / 极简白). Do not modify SubPanelTemplate. */
export const UNIVERSAL_PANEL_V2_CLASS = "visual-v2-sub-panel v2-panel-card universal-panel-v2-panel";

export const universalPanelCardClass = (...extra: string[]): string =>
  ["visual-v2-sub-panel", "v2-panel-card", "universal-panel-v2-panel", ...extra].filter(Boolean).join(" ");

export const universalPanelZoomClass = ["universal-panel-v2-panel", "is-zoom"];
