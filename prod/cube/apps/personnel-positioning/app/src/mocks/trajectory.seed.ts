import { OUTDOOR_BOUNDS, OUTDOOR_SCENE_ID, OUTDOOR_SCENE_NAME } from "../constants/realtime";
import type { PositioningState, PositionPoint } from "../models/positioning";
import type { PositionSceneEvent } from "../models/trajectory";

/** 第三方轨迹与场景事件的独立演示记录；场景事件不由路径推算。 */
export function addTrajectorySeed(state: PositioningState): void {
  const sceneName = (sceneId: string): string =>
    sceneId === OUTDOOR_SCENE_ID ? OUTDOOR_SCENE_NAME : `数据对接楼 · ${sceneId === "floor-09" ? "9层" : "10层"}`;
  function point(terminalId: string, at: string, sceneId: string, x: number, y: number): PositionPoint {
    return {
      terminalId,
      at,
      sceneId,
      scene: sceneName(sceneId),
      x,
      y,
      ...(sceneId === OUTDOOR_SCENE_ID
        ? {
            longitude: OUTDOOR_BOUNDS.west + (x / 100) * (OUTDOOR_BOUNDS.east - OUTDOOR_BOUNDS.west),
            latitude: OUTDOOR_BOUNDS.north - (y / 100) * (OUTDOOR_BOUNDS.north - OUTDOOR_BOUNDS.south),
          }
        : {}),
    };
  }
  const multiScene: [string, string, number, number][] = [
    ["00:00", "outdoor", 18, 65],
    ["00:08", "outdoor", 25, 58],
    ["00:16", "floor-09", 25, 45],
    ["00:24", "floor-09", 35, 50],
    ["00:32", "floor-10", 48, 30],
    ["00:40", "floor-10", 57, 37],
  ];
  for (const [time, sceneId, x, y] of multiScene) {
    state.positions.push(point("T20260001", `2026-09-07T${time}:00.000Z`, sceneId, x, y));
    state.positions.push(point("T20260012", `2026-09-06T${time}:00.000Z`, sceneId, x, y));
  }
  const current = state.bindings.find((binding) => binding.personId === "P20260005")!;
  current.startedAt = "2026-09-07T00:40:00.000Z";
  state.bindings.push({
    ...current,
    id: "binding-contractor-old",
    terminalId: "T20260018",
    startedAt: "2026-09-01T00:00:00.000Z",
    endedAt: "2026-09-07T00:30:00.000Z",
    endAction: "replace",
    endReason: "deviceFailure",
  });
  current.action = "replace";
  current.actionReason = "deviceFailure";
  state.positions.push(
    point("T20260018", "2026-09-07T00:00:00.000Z", "outdoor", 35, 68),
    point("T20260018", "2026-09-07T00:08:00.000Z", "outdoor", 40, 63),
    point("T20260018", "2026-09-07T00:16:00.000Z", "floor-10", 35, 52),
    point("T20260018", "2026-09-07T00:24:00.000Z", "floor-10", 45, 52),
    point("T20260005", "2026-09-07T00:40:00.000Z", "floor-10", 50, 52),
    point("T20260005", "2026-09-07T00:48:00.000Z", "floor-10", 62, 49),
  );
  state.bindings.push({
    id: "binding-single-point",
    personId: "P20260024",
    terminalId: "T20260024",
    startedAt: "2026-09-07T01:00:00.000Z",
    endedAt: "2026-09-07T02:00:00.000Z",
    action: "bind",
    actionReason: null,
    endAction: "unbind",
    endReason: "personnelAdjustment",
    operator: "设备管理员",
  });
  state.positions.push(point("T20260024", "2026-09-07T01:08:00.000Z", "floor-10", 30, 60));
  const sourceEvents: PositionSceneEvent[] = [];
  const eventFixtures: [PositionSceneEvent["kind"], string, string, string][] = [
    ["enter", "00:00:00", "outdoor", "进入园区室外场景"],
    ["leave", "00:08:30", "outdoor", "离开园区室外场景"],
    ["enter", "00:16:00", "floor-09", "进入数据对接楼9层"],
    ["switch", "00:32:00", "floor-10", "从数据对接楼9层切换至10层"],
  ];
  for (const [personId, day] of [
    ["P20260001", "07"],
    ["P20260012", "06"],
  ]) {
    eventFixtures.forEach(([kind, time, sceneId, description], index) =>
      sourceEvents.push({
        id: `scene-${personId}-${index}`,
        personId: personId!,
        kind,
        at: `2026-09-${day}T${time}.000Z`,
        sceneId,
        sceneName: sceneName(sceneId),
        description,
      }),
    );
  }
  sourceEvents.push(
    {
      id: "scene-contractor-enter",
      personId: "P20260005",
      kind: "enter",
      at: "2026-09-07T00:00:00.000Z",
      sceneId: "outdoor",
      sceneName: OUTDOOR_SCENE_NAME,
      description: "进入园区室外场景",
    },
    {
      id: "scene-contractor-floor",
      personId: "P20260005",
      kind: "enter",
      at: "2026-09-07T00:16:00.000Z",
      sceneId: "floor-10",
      sceneName: sceneName("floor-10"),
      description: "进入数据对接楼10层",
    },
  );
  state.sceneEvents = sourceEvents;
}
