import type { AreaPlaneMapVO } from "@ghcloud/cube-emergency-dispatch-service";

import type { FloorPlanImage, PlanTransform, RoutePoint } from "./types";
import { DEFAULT_PLAN_TRANSFORM } from "./types";

interface GpsLocationJson {
  lng?: number;
  lat?: number;
  scale?: number;
  rotation?: number;
}

export function parsePlanTransform(raw: string | null | undefined, fallbackCenter?: RoutePoint): PlanTransform | null {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return fallbackCenter ? DEFAULT_PLAN_TRANSFORM(fallbackCenter) : null;
  }
  try {
    const parsed = JSON.parse(trimmed) as GpsLocationJson;
    if (typeof parsed.lng !== "number" || typeof parsed.lat !== "number") {
      return fallbackCenter ? DEFAULT_PLAN_TRANSFORM(fallbackCenter) : null;
    }
    return {
      center: { lng: parsed.lng, lat: parsed.lat },
      scale: typeof parsed.scale === "number" ? parsed.scale : 1,
      rotation: typeof parsed.rotation === "number" ? parsed.rotation : 0,
    };
  } catch {
    return fallbackCenter ? DEFAULT_PLAN_TRANSFORM(fallbackCenter) : null;
  }
}

export interface MappedAreaPlaneMap {
  recordId: string;
  floorPlan: FloorPlanImage;
  transform: PlanTransform;
}

export function mapAreaPlaneMapToFloorPlan(vo: AreaPlaneMapVO): MappedAreaPlaneMap | null {
  const file = vo.file;
  if (!file) {
    return null;
  }
  const path = file.path?.trim() || "";
  const endpointPath = file.endpointPath?.trim() || "";
  const floorPlan: FloorPlanImage = {
    id: String(file.id),
    name: file.name ?? "",
    path,
    endpointPath,
    suffix: file.suffix ?? "",
    size: file.size ?? 0,
    refCount: file.refCount ?? 0,
    type: file.type ?? "",
    businessKey: file.businessKey == null ? null : String(file.businessKey),
  };
  const transform = parsePlanTransform(vo.gpsLocation) ?? DEFAULT_PLAN_TRANSFORM({ lng: 0, lat: 0 });
  return {
    recordId: String(vo.id),
    floorPlan,
    transform,
  };
}
