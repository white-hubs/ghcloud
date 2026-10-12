import type { EvacuationRoute, PlanTransform, RoutePoint } from "./types";
import { DEFAULT_MAP_CENTER, PLAN_BASE_SPAN } from "./types";

export interface NormalizedPoint {
  x: number;
  y: number;
}

/** 平面图在地图上的半宽（经纬度），与 PC `PLAN_BASE_SPAN * scale` 一致 */
export function getPlanSpan(transform: PlanTransform): number {
  return PLAN_BASE_SPAN * (transform.scale > 0 ? transform.scale : 1);
}

/** 地图视口半宽：略大于平面图，保留 GIS 底图边距 */
export function getMapViewportSpan(transform: PlanTransform, paddingFactor = 1.6): number {
  return getPlanSpan(transform) * paddingFactor;
}

export function lngLatToNormalized(point: RoutePoint, center: RoutePoint, viewportSpan: number): NormalizedPoint {
  const half = viewportSpan;
  return {
    x: (point.lng - center.lng) / (half * 2) + 0.5,
    y: 0.5 - (point.lat - center.lat) / (half * 2),
  };
}

export function lngLatToPercent(
  point: RoutePoint,
  center: RoutePoint = DEFAULT_MAP_CENTER,
  viewportSpan = PLAN_BASE_SPAN * 1.6,
): { left: string; top: string } {
  const norm = lngLatToNormalized(point, center, viewportSpan);
  const x = Math.max(0.02, Math.min(0.98, norm.x));
  const y = Math.max(0.02, Math.min(0.98, norm.y));
  return {
    left: `${(x * 100).toFixed(1)}%`,
    top: `${(y * 100).toFixed(1)}%`,
  };
}

/** 平面图在统一地图上的叠加区域（百分比），与 PC Leaflet imageOverlay bounds 对齐 */
export function getPlanOverlayRect(
  transform: PlanTransform,
  paddingFactor = 1.6,
): { left: string; top: string; width: string; height: string } {
  const planSpan = getPlanSpan(transform);
  const viewportSpan = getMapViewportSpan(transform, paddingFactor);
  const ratio = planSpan / viewportSpan;
  const offset = ((1 - ratio) / 2) * 100;
  return {
    left: `${offset.toFixed(2)}%`,
    top: `${offset.toFixed(2)}%`,
    width: `${(ratio * 100).toFixed(2)}%`,
    height: `${(ratio * 100).toFixed(2)}%`,
  };
}

export function buildRoutePolyline(
  points: RoutePoint[],
  transform: PlanTransform,
  width: number,
  height: number,
  paddingFactor = 1.6,
): string {
  if (points.length < 2) {
    return "";
  }
  const viewportSpan = getMapViewportSpan(transform, paddingFactor);
  const coords = points.map((p) => {
    const norm = lngLatToNormalized(p, transform.center, viewportSpan);
    return `${norm.x * width},${norm.y * height}`;
  });
  return coords.join(" ");
}

export function buildRouteSvgContent(
  routes: EvacuationRoute[],
  transform: PlanTransform,
  width: number,
  height: number,
  paddingFactor = 1.6,
): string {
  return routes
    .map((route) => {
      const polyline = buildRoutePolyline(route.points, transform, width, height, paddingFactor);
      if (!polyline) {
        return "";
      }
      const opacity = route.enabled ? 0.9 : 0.35;
      return `<polyline points="${polyline}" fill="none" stroke="${route.color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`;
    })
    .join("");
}
