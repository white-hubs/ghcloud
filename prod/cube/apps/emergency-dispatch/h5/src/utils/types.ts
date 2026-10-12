export type RoutePriority = "高" | "中" | "低";

export type RouteTrafficStatus = "畅通" | "拥挤" | "阻断" | "已禁用";

export interface RoutePoint {
  lng: number;
  lat: number;
}

export interface FloorPlanImage {
  id: string;
  name: string;
  path: string;
  endpointPath?: string;
  suffix?: string;
  size?: number;
  refCount?: number;
  type?: string;
  businessKey?: string | null;
  aspectRatio?: number;
}

export interface PlanTransform {
  center: RoutePoint;
  scale: number;
  rotation: number;
}

export const DEFAULT_PLAN_TRANSFORM = (center: RoutePoint): PlanTransform => ({
  center: { ...center },
  scale: 1,
  rotation: 0,
});

export interface EvacuationRoute {
  id: string;
  name: string;
  capacity: number;
  priority: RoutePriority;
  points: RoutePoint[];
  color: string;
  enabled: boolean;
  trafficStatus: RouteTrafficStatus;
}

export type EmergencyEventStatus = "processing" | "pending" | "resolved";

export type EmergencyEventLevelKey = "major" | "serious" | "moderate" | "normal";

export interface EmergencyEvent {
  id: string;
  type: string;
  icon: string;
  level: string;
  levelKey: EmergencyEventLevelKey;
  location: string;
  status: EmergencyEventStatus;
  statusLabel: string;
  time: string;
  firePoint: RoutePoint | null;
  areaId?: string | null;
  areaName?: string | null;
}

export interface AreaTreeItem {
  id: string;
  name: string;
  expanded: boolean;
  children: AreaTreeItem[];
}

export const DEFAULT_MAP_CENTER: RoutePoint = { lng: 114.057_939, lat: 22.543_527 };
export const PLAN_BASE_SPAN = 0.0018;
