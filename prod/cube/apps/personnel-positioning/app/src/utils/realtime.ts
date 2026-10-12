import { OUTDOOR_BOUNDS, OUTDOOR_SCENE_ID } from "../constants/realtime";
import type { PositioningState, PositionPoint } from "../models/positioning";
import type { AlarmAction, LocatedPerson, MapCoordinate, MonitorRegion, PositionAlarm } from "../models/realtime";

export function mapCoordinate(point: PositionPoint): MapCoordinate | null {
  const isOutdoor = point.sceneId === OUTDOOR_SCENE_ID;
  const coordinate = isOutdoor
    ? {
        x: (((point.longitude ?? NaN) - OUTDOOR_BOUNDS.west) / (OUTDOOR_BOUNDS.east - OUTDOOR_BOUNDS.west)) * 100,
        y: ((OUTDOOR_BOUNDS.north - (point.latitude ?? NaN)) / (OUTDOOR_BOUNDS.north - OUTDOOR_BOUNDS.south)) * 100,
      }
    : { x: point.x, y: point.y };
  const valid = isOutdoor
    ? [coordinate.x, coordinate.y].every((value) => Number.isFinite(value) && value >= 0 && value <= 100)
    : point.coordinateType === "INDOOR"
      ? [coordinate.x, coordinate.y].every((value) => Number.isFinite(value))
      : [coordinate.x, coordinate.y].every((value) => Number.isFinite(value) && value >= 0 && value <= 100);
  return valid ? coordinate : null;
}

/** 只关联当前绑定时段的最后位置，避免换绑后沿用旧终端的位置。 */
export function currentLocations(state: PositioningState): LocatedPerson[] {
  const points =
    state.realtimeLocations === undefined
      ? state.bindings
          .filter((binding) => binding.endedAt === null)
          .map((binding) =>
            state.positions
              .filter((point) => point.terminalId === binding.terminalId)
              .toSorted((left, right) => Date.parse(left.at) - Date.parse(right.at))
              .at(-1),
          )
          .filter((point): point is PositionPoint => Boolean(point))
      : state.realtimeLocations;
  return points.flatMap((point) => {
    const personId =
      point.personId ?? state.bindings.find((item) => item.terminalId === point.terminalId && item.endedAt === null)?.personId;
    const person = state.persons.find((item) => item.id === personId);
    const terminal = state.devices.find((item) => item.id === point.terminalId && item.kind === "terminal");
    if (!person || !terminal || !terminal.enabled || !point.sceneId) return [];
    return [{ person, terminal, point, sceneId: point.sceneId, coordinate: mapCoordinate(point) }];
  });
}

export function isOngoingAlarm(alarm: PositionAlarm): boolean {
  return ["pending", "confirmed", "processing"].includes(alarm.state) && !alarm.recoveredAt && !alarm.closedAt;
}
export function sortedAlarms(alarms: PositionAlarm[]): PositionAlarm[] {
  return [...alarms].sort((a, b) => a.level - b.level || (Date.parse(b.occurredAt ?? "") || 0) - (Date.parse(a.occurredAt ?? "") || 0));
}
export function alarmDuration(alarm: PositionAlarm, now = Date.now()): string {
  const start = Date.parse(alarm.occurredAt ?? "");
  const end = alarm.recoveredAt ? Date.parse(alarm.recoveredAt) : alarm.closedAt ? Date.parse(alarm.closedAt) : now;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return "--";
  }
  const minutes = Math.floor((end - start) / 60000);
  return minutes < 1 ? "少于1分钟" : `${minutes}分钟`;
}
export function availableAlarmActions(alarm: PositionAlarm): AlarmAction[] {
  if (alarm.state === "pending") {
    return ["confirm", "falseAlarm"];
  }
  if (alarm.state === "confirmed") {
    return ["assign", "close"];
  }
  if (alarm.state === "processing") {
    return ["progress", "close"];
  }
  if (alarm.state === "recovered") {
    return ["close"];
  }
  return [];
}
export function insideRegion(point: MapCoordinate, region: MonitorRegion): boolean {
  let inside = false;
  for (let i = 0, j = region.boundary.length - 1; i < region.boundary.length; j = i++) {
    const a = region.boundary[i]!;
    const b = region.boundary[j]!;
    if (a.y > point.y !== b.y > point.y && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}
export function positionCoordinateText(point: PositionPoint): string {
  if (point.sceneId === OUTDOOR_SCENE_ID || point.coordinateType === "OUTDOOR") {
    return `经度 ${point.longitude?.toFixed(6) ?? "—"}°，纬度 ${point.latitude?.toFixed(6) ?? "—"}°`;
  }
  const indoor = [
    point.buildingName,
    point.floorName,
    Number.isFinite(point.x) ? `X ${point.x.toFixed(2)} m` : "X —",
    Number.isFinite(point.y) ? `Y ${point.y.toFixed(2)} m` : "Y —",
    Number.isFinite(point.z ?? NaN) ? `Z ${(point.z as number).toFixed(2)} m` : "",
  ].filter(Boolean);
  return indoor.join(" · ") || "室内坐标暂无";
}
