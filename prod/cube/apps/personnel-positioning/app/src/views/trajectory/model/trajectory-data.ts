import { ALARM_TYPES } from "@/constants/realtime";
import { TRAJECTORY_EVENT_TYPES, TRAJECTORY_GAP_MS } from "@/constants/trajectory";
import type { BindingRecord, PositionPoint } from "@/models/positioning";
import type { MapCoordinate, PositionAlarm } from "@/models/realtime";
import type { PositionSceneEvent, TrajectoryEvent, TrajectorySegment } from "@/models/trajectory";
import { mapCoordinate } from "@/utils/realtime";

export type { TrajectorySegment } from "@/models/trajectory";
export { TRAJECTORY_GAP_MS } from "@/constants/trajectory";
export type TrajectoryRange = [string, string];
export const trajectorySceneId = (point: PositionPoint): string => point.sceneId || point.scene;
export const pointKey = (point: PositionPoint): string => `${point.terminalId}-${Date.parse(point.at)}-${trajectorySceneId(point)}`;

/** 地图在回放开始前不展示轨迹点，开始后只展示当前时刻已上报的点。 */
export function trajectoryPointsUntil<T extends { point: Pick<PositionPoint, "at"> }>(
  points: readonly T[],
  at: number,
  started: boolean,
): T[] {
  return started && Number.isFinite(at) ? points.filter(({ point }) => Date.parse(point.at) <= at) : [];
}

/** 回放线只绘制已播放的部分，当前两次上报之间按时间比例延伸到线段中途。 */
export function trajectoryProgressCoordinates(
  points: readonly { point: Pick<PositionPoint, "at">; coordinate: MapCoordinate }[],
  at: number,
): MapCoordinate[] {
  if (!points.length || !Number.isFinite(at) || at < Date.parse(points[0]!.point.at)) return [];
  const result = [points[0]!.coordinate];
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]!;
    const next = points[index]!;
    const previousTime = Date.parse(previous.point.at);
    const nextTime = Date.parse(next.point.at);
    if (at < nextTime) {
      const progress = (at - previousTime) / (nextTime - previousTime);
      if (progress > 0)
        result.push({
          x: previous.coordinate.x + (next.coordinate.x - previous.coordinate.x) * progress,
          y: previous.coordinate.y + (next.coordinate.y - previous.coordinate.y) * progress,
        });
      return result;
    }
    result.push(next.coordinate);
  }
  return result;
}

/** 重复上报保留最后一条；后端轨迹接口已校验绑定区间，可信结果无需前端二次过滤。 */
export function buildTrajectorySegments(points: PositionPoint[], bindings: BindingRecord[], alreadyValidated = false): TrajectorySegment[] {
  const result: TrajectorySegment[] = [];
  const unique = new Map(points.map((point) => [pointKey(point), point]));
  let canConnect = true;
  for (const point of [...unique.values()].sort((a, b) => Date.parse(a.at) - Date.parse(b.at))) {
    const at = Date.parse(point.at);
    const binding = bindings.find(
      (item) =>
        item.terminalId === point.terminalId && at >= Date.parse(item.startedAt) && (!item.endedAt || at < Date.parse(item.endedAt)),
    );
    const bindingId = binding?.id ?? (alreadyValidated ? point.terminalId : "");
    if (!bindingId || !Number.isFinite(at) || !mapCoordinate(point) || !trajectorySceneId(point)) {
      canConnect = false;
      continue;
    }
    const previous = result.at(-1);
    const last = previous?.points.at(-1);
    const gapBefore = Boolean(
      previous && last && (!canConnect || previous.bindingId !== bindingId || at - Date.parse(last.at) > TRAJECTORY_GAP_MS),
    );
    if (previous && last && !gapBefore && previous.sceneId === trajectorySceneId(point)) {
      previous.points.push(point);
    } else {
      result.push({
        id: `${bindingId}-${point.at}`,
        bindingId,
        sceneId: trajectorySceneId(point),
        scene: point.scene,
        points: [point],
        gapBefore,
      });
    }
    canConnect = true;
  }
  return result;
}

const pad = (value: number): string => String(value).padStart(2, "0");
export function localDateTime(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
export function defaultTrajectoryRange(points: PositionPoint[]): TrajectoryRange {
  const latest = points
    .filter((point) => Number.isFinite(Date.parse(point.at)))
    .toSorted((a, b) => Date.parse(a.at) - Date.parse(b.at))
    .at(-1);
  const date = latest ? new Date(latest.at) : new Date();
  const day = localDateTime(date).slice(0, 10);
  return [`${day} 00:00:00`, `${day} 23:59:59`];
}
export function quickTrajectoryRange(days: number, yesterday = false, now = new Date()): TrajectoryRange {
  const start = new Date(now);
  const end = new Date(now);
  start.setDate(start.getDate() - (yesterday ? 1 : days - 1));
  start.setHours(0, 0, 0, 0);
  if (yesterday) {
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 0);
  }
  return [localDateTime(start), localDateTime(end)];
}
export const parseRangeTime = (value: string): number => Date.parse(value.replace(" ", "T"));
export function trajectoryRangeError(range: TrajectoryRange | null | undefined): string {
  if (!range?.[0] || !range[1]) {
    return "请选择完整的开始和结束时间";
  }
  const start = parseRangeTime(range[0]);
  const end = parseRangeTime(range[1]);
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return "请选择有效的时间";
  }
  return start > end ? "开始时间不能晚于结束时间" : "";
}
export function filterTrajectoryPoints(points: PositionPoint[], range: TrajectoryRange): PositionPoint[] {
  if (trajectoryRangeError(range)) {
    return [];
  }
  const start = parseRangeTime(range[0]);
  const end = parseRangeTime(range[1]);
  return points.filter((point) => Date.parse(point.at) >= start && Date.parse(point.at) <= end);
}

/** 回放展示当时最后一次上报的位置；跨空窗不沿用旧位置，也不推算移动或停留。 */
export function trajectoryFrame(
  segments: TrajectorySegment[],
  at: number,
): { segment: TrajectorySegment; point: PositionPoint } | undefined {
  const segment = segments.find((item) => at >= Date.parse(item.points[0]!.at) && at <= Date.parse(item.points.at(-1)!.at));
  const point = segment?.points.findLast((item) => Date.parse(item.at) <= at);
  return segment && point ? { segment, point } : undefined;
}

export function trajectoryEvents(
  personId: string,
  range: TrajectoryRange,
  sourceEvents: PositionSceneEvent[],
  alarms: PositionAlarm[],
  segments: TrajectorySegment[],
): TrajectoryEvent[] {
  if (trajectoryRangeError(range)) {
    return [];
  }
  const start = parseRangeTime(range[0]);
  const end = parseRangeTime(range[1]);
  const within = (at: string | null): boolean => Boolean(at && Date.parse(at) >= start && Date.parse(at) <= end);
  const events: TrajectoryEvent[] = sourceEvents
    .filter((event) => event.personId === personId && within(event.at))
    .map((event) => ({ ...event, title: TRAJECTORY_EVENT_TYPES[event.kind].label }));
  for (const alarm of alarms.filter((item) => item.personId === personId && within(item.occurredAt))) {
    events.push({
      id: alarm.id,
      kind: "alarm",
      at: alarm.occurredAt!,
      sceneId: alarm.sceneId,
      sceneName: alarm.sceneName,
      title: ALARM_TYPES[alarm.type],
      description: alarm.actualValue,
      regionName: alarm.regionName,
      coordinateText: alarm.coordinateText,
      alarmId: alarm.id,
    });
  }
  segments.forEach((segment, index) => {
    const previous = segments[index - 1];
    if (segment.gapBefore && previous) {
      events.push({
        id: `gap-${segment.id}`,
        kind: "gap",
        at: previous.points.at(-1)!.at,
        endAt: segment.points[0]!.at,
        sceneId: previous.sceneId,
        sceneName: previous.scene,
        title: "暂无轨迹数据",
        description: "该时间段没有可连接的有效位置，前后轨迹不连接。",
      });
    }
  });
  return events.sort((a, b) => Date.parse(a.at) - Date.parse(b.at) || a.id.localeCompare(b.id));
}
