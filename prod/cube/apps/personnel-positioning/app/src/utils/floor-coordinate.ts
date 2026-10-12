import type { PositionPoint } from "@/models/positioning";
import type { MapCoordinate } from "@/models/realtime";

export interface FloorCoordinateAxis {
  bottomLeft: MapCoordinate;
  topRight: MapCoordinate;
}

export function parseFloorCoordinateAxis(value: string | null | undefined): FloorCoordinateAxis | null {
  if (!value) return null;
  try {
    const axis: unknown = JSON.parse(value);
    if (!axis || typeof axis !== "object") return null;
    const { bottomLeft, topRight } = axis as Partial<FloorCoordinateAxis>;
    if (!bottomLeft || !topRight) return null;
    if (![bottomLeft.x, bottomLeft.y, topRight.x, topRight.y].every((number) => typeof number === "number" && Number.isFinite(number))) {
      return null;
    }
    if (topRight.x <= bottomLeft.x || topRight.y <= bottomLeft.y) return null;
    return { bottomLeft, topRight };
  } catch {
    return null;
  }
}

/** 楼层坐标以左下角为原点，地图百分比坐标以左上角为原点。 */
export function projectFloorCoordinate(point: Pick<PositionPoint, "x" | "y">, axis: FloorCoordinateAxis | null): MapCoordinate | null {
  if (!axis || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return null;
  const x = ((point.x - axis.bottomLeft.x) / (axis.topRight.x - axis.bottomLeft.x)) * 100;
  const y = ((axis.topRight.y - point.y) / (axis.topRight.y - axis.bottomLeft.y)) * 100;
  return x >= 0 && x <= 100 && y >= 0 && y <= 100 ? { x, y } : null;
}
