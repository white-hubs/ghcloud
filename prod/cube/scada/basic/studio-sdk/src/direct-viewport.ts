export const MIN_DIRECT_SCALE = 0.05;
export const MAX_DIRECT_SCALE = 4;

export interface ViewportSize {
  width: number;
  height: number;
}

export interface ViewportTranslation {
  tx: number;
  ty: number;
}

const MIN_VISIBLE_CANVAS_SIZE = 48;
const SCADA_WHEEL_SCROLL_SELECTOR = "[data-scada-wheel-scroll]";

export function isDirectViewportScrollTarget(target: unknown): boolean {
  if (!target || typeof target !== "object") return false;
  const closest = (target as { closest?: unknown }).closest;
  if (typeof closest !== "function") return false;
  return Boolean(closest.call(target, SCADA_WHEEL_SCROLL_SELECTOR));
}

export function clampDirectScale(scale: number, minimum = MIN_DIRECT_SCALE): number {
  return Math.min(MAX_DIRECT_SCALE, Math.max(minimum, scale));
}

export function fitDirectScale(pageSize: ViewportSize, viewportSize: ViewportSize): number {
  if (pageSize.width <= 0 || pageSize.height <= 0 || viewportSize.width <= 0 || viewportSize.height <= 0) {
    return 1;
  }
  return Math.min(viewportSize.width / pageSize.width, viewportSize.height / pageSize.height, 1);
}

export function canStartDirectPan(button: number, pointerType: string): boolean {
  return pointerType === "touch" || pointerType === "pen" || button === 0 || button === 2;
}

function clampPanAxis(position: number, contentSize: number, viewportSize: number): number {
  if (contentSize <= 0 || viewportSize <= 0) return position;
  const visibleSize = Math.min(MIN_VISIBLE_CANVAS_SIZE, contentSize, viewportSize);
  return Math.min(viewportSize - visibleSize, Math.max(visibleSize - contentSize, position));
}

export function clampDirectPan(
  translation: ViewportTranslation,
  scaledPageSize: ViewportSize,
  viewportSize: ViewportSize,
): ViewportTranslation {
  return {
    tx: clampPanAxis(translation.tx, scaledPageSize.width, viewportSize.width),
    ty: clampPanAxis(translation.ty, scaledPageSize.height, viewportSize.height),
  };
}
