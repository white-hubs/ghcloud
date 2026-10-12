import type { EvacuationRoutePriority, EvacuationRouteVO } from "@ghcloud/cube-emergency-dispatch-service";

import type { EvacuationRoute, RoutePoint, RoutePriority, RouteTrafficStatus } from "./types";

export const PRIORITY_ROUTE_COLORS = {
  高: "#EF4444",
  中: "#FACC15",
  低: "#10B981",
} as const;

export function priorityToRouteColor(priority: RoutePriority): string {
  return PRIORITY_ROUTE_COLORS[priority] ?? "#FACC15";
}

const API_PRIORITY_TO_UI: Record<EvacuationRoutePriority, RoutePriority> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
};

export function priorityFromApi(priority: EvacuationRoutePriority, priorityName?: string): RoutePriority {
  if (priorityName?.includes("高")) {
    return "高";
  }
  if (priorityName?.includes("低")) {
    return "低";
  }
  if (priorityName?.includes("中")) {
    return "中";
  }
  return API_PRIORITY_TO_UI[priority] ?? "中";
}

export function parsePathConfig(json?: string | null): RoutePoint[] {
  if (!json?.trim()) {
    return [];
  }
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => {
        if (item && typeof item === "object" && "lng" in item && "lat" in item) {
          const lng = Number((item as RoutePoint).lng);
          const lat = Number((item as RoutePoint).lat);
          if (Number.isFinite(lng) && Number.isFinite(lat)) {
            return { lng, lat };
          }
        }
        return null;
      })
      .filter((p): p is RoutePoint => p !== null);
  } catch {
    return [];
  }
}

export function mapTrafficStatus(vo: EvacuationRouteVO): RouteTrafficStatus {
  if (vo.enabled === false) {
    return "阻断";
  }
  if (vo.priority === "HIGH") {
    return "畅通";
  }
  return "拥挤";
}

export function mapEvacuationRouteVO(vo: EvacuationRouteVO): EvacuationRoute {
  const priority = priorityFromApi(vo.priority, vo.priorityName);
  return {
    id: String(vo.id),
    name: vo.routeName,
    capacity: vo.capacity,
    priority,
    points: parsePathConfig(vo.pathConfigJson),
    color: priorityToRouteColor(priority),
    enabled: vo.enabled !== false,
    trafficStatus: mapTrafficStatus(vo),
  };
}
