import type { CSSProperties } from "vue";

import type { RoutePoint } from "@/utils/types";

export const USER_MARKER_STYLE: CSSProperties = {
  width: "16px",
  height: "16px",
  borderRadius: "50%",
  background: "#10b981",
  border: "2px solid #ffffff",
  boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)",
};

export const ALARM_MARKER_STYLE: CSSProperties = {
  width: "14px",
  height: "14px",
  borderRadius: "50%",
  background: "#ef4444",
  boxShadow: "0 0 10px rgba(239, 68, 68, 0.8)",
};

export function markerStyleAt(left: string, top: string, dotStyle: CSSProperties): CSSProperties {
  return {
    position: "absolute",
    left,
    top,
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    zIndex: 2,
    ...dotStyle,
  };
}

export function cloneRoutePoint(point: RoutePoint): RoutePoint {
  return { lng: point.lng, lat: point.lat };
}
