export const DESIGN_WIDTH = 1920;
export const DESIGN_HEIGHT = 1080;
export const ROOT_VALUE = 192;
/** Inherited text size, independent of the rem root. Matches former amfe-flexible body reset. */
export const BODY_FONT_SIZE = 16;

/**
 * Never shrink rem below the 1920×1080 design.
 * Laptop viewports used to scale to ~0.67–0.75, turning 12px card type into ~8px.
 * Height pressure is handled by card density / overflow, not by shrinking glyphs.
 */
export const MIN_UI_SCALE = 1;

export const PANEL_WIDTH_DESIGN = 400;
export const PANEL_WIDTH_MIN = 280;
export const PANEL_WIDTH_MAX = 480;
export const CENTER_RESERVE_MIN = 320;
export const CENTER_RESERVE_RATIO = 0.28;
export const PANEL_WIDTH_ABSOLUTE_MIN = 160;

/** Axis / caption floor so ECharts labels stay readable if a caller still passes a sub-1 scale. */
export const MIN_AXIS_FONT_PX = 11;
export const MIN_LABEL_FONT_PX = 12;

export type ViewportMode = "normal" | "compact";

export interface ViewportMetrics {
  viewportWidth: number;
  viewportHeight: number;
  widthRatio: number;
  widthScale: number;
  heightRatio: number;
  rawScale: number;
  uiScale: number;
  rootFontSize: number;
  bodyFontSize: number;
  panelWidthPx: number;
  mode: ViewportMode;
}

const normalizeDimension = (value: number): number => (Number.isFinite(value) && value > 0 ? value : 0);

export const resolvePanelWidthPx = (viewportWidth: number, widthScale: number): number => {
  const vw = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 0;
  const scale = Number.isFinite(widthScale) && widthScale > 0 ? widthScale : 0;
  const desired = Math.min(PANEL_WIDTH_MAX, Math.max(PANEL_WIDTH_MIN, PANEL_WIDTH_DESIGN * scale));
  const centerReserve = Math.max(CENTER_RESERVE_MIN, CENTER_RESERVE_RATIO * vw);
  if (2 * desired + centerReserve <= vw) {
    return desired;
  }
  const shrunk = (vw - centerReserve) / 2;
  if (shrunk >= PANEL_WIDTH_MIN) {
    return shrunk;
  }
  return Math.min(PANEL_WIDTH_MIN, Math.max(PANEL_WIDTH_ABSOLUTE_MIN, (vw - 16) / 2));
};

export const resolveScaledFontSize = (designPx: number, uiScale: number): number => {
  const size = Number.isFinite(designPx) ? designPx : 0;
  const scale = Number.isFinite(uiScale) && uiScale > 0 ? uiScale : 1;
  const scaled = size * scale;
  if (size >= MIN_LABEL_FONT_PX) {
    return Math.max(scaled, MIN_LABEL_FONT_PX);
  }
  if (size >= 10) {
    return Math.max(scaled, MIN_AXIS_FONT_PX);
  }
  return scaled;
};

export const resolveViewportMetrics = (width: number, height: number): ViewportMetrics => {
  const viewportWidth = normalizeDimension(width);
  const viewportHeight = normalizeDimension(height);
  const widthRatio = viewportWidth / DESIGN_WIDTH;
  const widthScale = viewportWidth / DESIGN_WIDTH;
  const heightRatio = viewportHeight / DESIGN_HEIGHT;
  const rawScale = viewportWidth > 0 && viewportHeight > 0 ? Math.min(widthRatio, heightRatio) : 0;
  const uiScale = Math.max(MIN_UI_SCALE, rawScale);
  const panelWidthPx = resolvePanelWidthPx(viewportWidth, widthScale);

  return {
    viewportWidth,
    viewportHeight,
    widthRatio,
    widthScale,
    heightRatio,
    rawScale,
    uiScale,
    rootFontSize: ROOT_VALUE * uiScale,
    bodyFontSize: BODY_FONT_SIZE * uiScale,
    panelWidthPx,
    mode: rawScale < MIN_UI_SCALE ? "compact" : "normal",
  };
};
