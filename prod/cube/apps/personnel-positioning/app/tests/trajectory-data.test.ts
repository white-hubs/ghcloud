import { describe, expect, test } from "bun:test";

import { createPositioningRepository } from "../src/mocks/positioning.repository";
import { createPositioningSeed } from "../src/mocks/positioning.seed";
import { createRealtimeSeed } from "../src/mocks/realtime.seed";
import type { BindingRecord, PositionPoint } from "../src/models/positioning";
import { projectFloorCoordinate } from "../src/utils/floor-coordinate";
import { normalizeDateTime } from "../src/utils/positioning";
import {
  buildTrajectorySegments,
  filterTrajectoryPoints,
  trajectoryPointsUntil,
  trajectoryProgressCoordinates,
  trajectoryFrame,
  trajectoryEvents,
  trajectoryRangeError,
  quickTrajectoryRange,
  defaultTrajectoryRange,
} from "../src/views/trajectory/model/trajectory-data";

const binding = (id: string, terminalId: string, startedAt: string, endedAt: string | null): BindingRecord => ({
  id,
  personId: "person",
  terminalId,
  startedAt,
  endedAt,
  action: "bind",
  actionReason: null,
  endReason: endedAt ? "personnelAdjustment" : null,
  endAction: endedAt ? "unbind" : null,
  operator: "管理员",
});
const point = (at: string, terminalId = "A", scene = "一层"): PositionPoint => ({ terminalId, at, scene, x: 10, y: 20 });

describe("人员轨迹有效区间与分段", () => {
  test("同场景、同绑定的相邻采样可连接", () => {
    const points = [point("2026-09-07T01:00:00Z"), point("2026-09-07T01:08:00Z")];
    expect(buildTrajectorySegments(points, [binding("first", "A", "2026-09-07T00:00:00Z", null)]).map((item) => item.points)).toEqual([
      points,
    ]);
  });

  test("同一终端先解绑再重绑也必须分段，并排除空窗期的位置", () => {
    const points = [point("2026-09-07T01:00:00Z"), point("2026-09-07T01:05:00Z"), point("2026-09-07T01:10:00Z")];
    const intervals = [
      binding("first", "A", "2026-09-07T00:00:00Z", "2026-09-07T01:05:00Z"),
      binding("second", "A", "2026-09-07T01:10:00Z", null),
    ];
    expect(buildTrajectorySegments(points, intervals).map((item) => item.points)).toEqual([[points[0]!], [points[2]!]]);
  });

  test("换终端、切场景和超过15分钟的数据空档均不会产生连线", () => {
    const points = [
      point("2026-09-07T01:00:00Z"),
      point("2026-09-07T01:01:00Z", "B"),
      point("2026-09-07T01:02:00Z", "B", "二层"),
      point("2026-09-08T01:02:00Z", "B", "二层"),
    ];
    const intervals = [
      binding("first", "A", "2026-09-07T00:00:00Z", "2026-09-07T01:01:00Z"),
      binding("second", "B", "2026-09-07T01:01:00Z", null),
    ];
    expect(buildTrajectorySegments(points, intervals).map((item) => item.points.length)).toEqual([1, 1, 1, 1]);
  });
});

describe("历史轨迹查询与回放", () => {
  const interval = binding("active", "A", "2026-09-01T00:00:00Z", null);
  test("初始不画线，回放按时间逐渐延伸，暂停或拖动时保留对应进度", () => {
    const start = Date.parse("2026-09-07T01:00:00Z");
    const samples = [
      { point: point(new Date(start).toISOString()), coordinate: { x: 10, y: 30 } },
      { point: point(new Date(start + 10_000).toISOString()), coordinate: { x: 30, y: 50 } },
      { point: point(new Date(start + 20_000).toISOString()), coordinate: { x: 50, y: 50 } },
    ];
    expect(trajectoryProgressCoordinates(samples, start - 1)).toEqual([]);
    expect(trajectoryProgressCoordinates(samples, start)).toEqual([{ x: 10, y: 30 }]);
    expect(trajectoryProgressCoordinates(samples, start + 5_000)).toEqual([
      { x: 10, y: 30 },
      { x: 20, y: 40 },
    ]);
    expect(trajectoryProgressCoordinates(samples, start + 15_000)).toEqual([
      { x: 10, y: 30 },
      { x: 30, y: 50 },
      { x: 40, y: 50 },
    ]);
    expect(trajectoryProgressCoordinates(samples, start + 20_000)).toEqual(samples.map((sample) => sample.coordinate));
    expect(trajectoryProgressCoordinates(samples, start)).toHaveLength(1);
    expect(trajectoryPointsUntil(samples, start, false)).toEqual([]);
    expect(trajectoryPointsUntil(samples, start, true)).toEqual([samples[0]]);
    expect(trajectoryPointsUntil(samples, start + 15_000, true)).toEqual([samples[0], samples[1]]);
    expect(trajectoryPointsUntil(samples, start + 20_000, true)).toHaveLength(3);
  });
  test("毫秒时间戳与空区域 ID 的室内轨迹仍可筛选、落到平面图并回放", () => {
    const sample = {
      positioningAreaId: "",
      positioningDeviceId: "2104414086142439426",
      locationTime: 1790577042000,
      floorId: "7",
      floorName: "古河云",
      coordinateX: 4.6474110772,
      coordinateY: 11.7810813665,
      coordinateType: "INDOOR" as const,
    };
    const at = normalizeDateTime(sample.locationTime);
    const first: PositionPoint = {
      terminalId: sample.positioningDeviceId,
      at,
      sceneId: sample.positioningAreaId || sample.floorId,
      scene: sample.floorName,
      floorId: sample.floorId,
      coordinateType: sample.coordinateType,
      x: sample.coordinateX,
      y: sample.coordinateY,
    };
    const second = { ...first, at: new Date(sample.locationTime + 10_000).toISOString(), x: 6 };
    const day = new Date(sample.locationTime);
    const range: [string, string] = [
      new Date(day.getFullYear(), day.getMonth(), day.getDate()).toISOString(),
      new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1).toISOString(),
    ];
    const segments = buildTrajectorySegments(filterTrajectoryPoints([first, second], range), [], true);
    expect(at).toBe(new Date(sample.locationTime).toISOString());
    expect(segments.map((segment) => segment.points.length)).toEqual([2]);
    expect(trajectoryFrame(segments, sample.locationTime + 5_000)?.point).toEqual(first);
    const mapped = projectFloorCoordinate(first, { bottomLeft: { x: 0, y: 0 }, topRight: { x: 21, y: 17.55223880597015 } });
    expect(mapped?.x).toBeCloseTo((sample.coordinateX / 21) * 100);
    expect(mapped?.y).toBeCloseTo((1 - sample.coordinateY / 17.55223880597015) * 100);
  });
  test("无效坐标不能落点或跨点连线；重复上报保留最后一次数据", () => {
    const first = point("2026-09-07T01:00:00Z");
    const invalid = { ...point("2026-09-07T01:01:00Z"), x: NaN };
    const end = point("2026-09-07T01:02:00Z");
    const segments = buildTrajectorySegments([end, first, invalid, { ...end, x: 45 }], [interval]);
    expect(segments.map((segment) => segment.points.length)).toEqual([1, 1]);
    expect(segments[1]!.points[0]!.x).toBe(45);
    expect(segments[1]!.gapBefore).toBe(true);
  });
  test("同名楼层按场景编号区分，单点不产生折线", () => {
    const segments = buildTrajectorySegments(
      [
        { ...point("2026-09-07T01:00:00Z"), sceneId: "building-a-1" },
        { ...point("2026-09-07T01:01:00Z"), sceneId: "building-b-1" },
      ],
      [interval],
    );
    expect(segments.map((segment) => segment.sceneId)).toEqual(["building-a-1", "building-b-1"]);
    expect(segments.every((segment) => segment.points.length === 1)).toBe(true);
  });
  test("同一时刻的 UTC 与时区偏移上报按一条位置去重", () => {
    const segments = buildTrajectorySegments(
      [point("2026-09-07T01:00:00Z"), { ...point("2026-09-07T09:00:00+08:00"), x: 35 }, point("2026-09-07T01:08:00Z")],
      [interval],
    );
    expect(segments).toHaveLength(1);
    expect(segments[0]!.points).toHaveLength(2);
    expect(segments[0]!.points[0]!.x).toBe(35);
  });
  test("回放使用最后上报位置，空窗、场景切换期间和区间外不沿用旧位置", () => {
    const points = [point("2026-09-07T01:00:00Z"), point("2026-09-07T01:08:00Z"), point("2026-09-07T01:30:00Z", "A", "二层")];
    const segments = buildTrajectorySegments(points, [interval]);
    expect(trajectoryFrame(segments, Date.parse("2026-09-07T01:04:00Z"))?.point).toEqual(points[0]);
    expect(trajectoryFrame(segments, Date.parse("2026-09-07T01:20:00Z"))).toBeUndefined();
    expect(trajectoryFrame(segments, Date.parse("2026-09-07T01:30:00Z"))?.point).toEqual(points[2]);
    expect(trajectoryFrame(segments, Date.parse("2026-09-07T01:30:01Z"))).toBeUndefined();
    expect(trajectoryFrame(segments, Date.parse("2026-09-07T00:59:59Z"))).toBeUndefined();
  });
  test("时间查询包含两端，允许长周期跨日期并校验清空与倒序", () => {
    const points = [point("2026-08-01T01:00:00Z"), point("2026-09-07T01:00:00Z"), point("2026-09-07T01:00:01Z")];
    const range: [string, string] = [points[0]!.at, points[1]!.at];
    expect(trajectoryRangeError(range)).toBe("");
    expect(filterTrajectoryPoints(points, range)).toEqual(points.slice(0, 2));
    expect(trajectoryRangeError(null)).toContain("完整");
    expect(trajectoryRangeError([range[1], range[0]])).toContain("晚于");
    expect(trajectoryRangeError(["invalid", range[1]])).toContain("有效");
    expect(filterTrajectoryPoints(points, [range[1], range[0]])).toEqual([]);
  });
  test("快捷日期按本地自然日，已解绑人员默认定位至最近历史日期", () => {
    const now = new Date(2026, 8, 9, 14, 0, 0);
    expect(quickTrajectoryRange(3, false, now)).toEqual(["2026-09-07 00:00:00", "2026-09-09 14:00:00"]);
    expect(quickTrajectoryRange(1, true, now)).toEqual(["2026-09-08 00:00:00", "2026-09-08 23:59:59"]);
    expect(defaultTrajectoryRange([point(new Date(2026, 8, 6, 8).toISOString())])).toEqual(["2026-09-06 00:00:00", "2026-09-06 23:59:59"]);
  });
  test("历史绑定跨时区格式仍按实际时刻归属，不混入解绑边界及新持有人记录", () => {
    const state = createPositioningSeed();
    state.bindings = [binding("old", "A", "2026-09-07T08:00:00+08:00", "2026-09-07T08:10:00+08:00")];
    state.positions = [point("2026-09-07T00:00:00Z"), point("2026-09-07T00:09:59Z"), point("2026-09-07T00:10:00Z")];
    expect(createPositioningRepository(state).positionsFor("person")).toEqual(state.positions.slice(0, 2));
  });
  test("演示数据支持换绑、已解绑历史和单点，换绑空窗不连线", () => {
    const repo = createPositioningRepository(createPositioningSeed());
    const replaced = buildTrajectorySegments(repo.positionsFor("P20260005"), repo.history("P20260005"));
    expect(new Set(replaced.flatMap((segment) => segment.points.map((point) => point.terminalId))).size).toBe(2);
    expect(replaced.some((segment) => segment.gapBefore)).toBe(true);
    expect(repo.currentBinding("P20260012")).toBeUndefined();
    expect(repo.positionsFor("P20260012").length).toBeGreaterThan(1);
    expect(repo.positionsFor("P20260024")).toHaveLength(1);
    expect(repo.positionsFor("P20260013")).toEqual([]);
  });
  test("时间轴仅包含明确场景事件、本人时段内告警及无数据提示，不从轨迹推算进出或绑定事件", () => {
    const state = createPositioningSeed();
    const repo = createPositioningRepository(state);
    const range: [string, string] = ["2026-09-07T00:00:00Z", "2026-09-07T02:00:00Z"];
    const segments = buildTrajectorySegments(filterTrajectoryPoints(repo.positionsFor("P20260001"), range), repo.history("P20260001"));
    const alarms = createRealtimeSeed(state).alarms;
    const events = trajectoryEvents("P20260001", range, state.sceneEvents!, alarms, segments);
    expect(events.filter((event) => event.kind === "alarm").map((event) => event.id)).toEqual(["AL-20260907-006"]);
    expect(events.filter((event) => ["enter", "leave", "switch"].includes(event.kind))).toHaveLength(4);
    expect(events.some((event) => event.kind === "gap")).toBe(true);
    expect(trajectoryEvents("P20260001", range, [], [], segments).every((event) => event.kind === "gap")).toBe(true);
    expect(events.every((event) => !("terminalId" in event) && !("bindingId" in event))).toBe(true);
  });
});
