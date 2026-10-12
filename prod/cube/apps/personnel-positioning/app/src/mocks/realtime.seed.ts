import { OUTDOOR_SCENE_ID, OUTDOOR_SCENE_NAME } from "../constants/realtime";
import type { PositioningState } from "../models/positioning";
import type { MonitorRegion, PositionAlarm, RealtimeState } from "../models/realtime";
import { currentLocations, positionCoordinateText } from "../utils/realtime";

export function createRealtimeSeed(positioning: PositioningState): RealtimeState {
  const now = Date.now();
  const at = (minutes: number) => new Date(now - minutes * 60000).toISOString();
  function region(id: string, sceneId: string, name: string, x: number, y: number, width: number, height: number): MonitorRegion {
    return {
      id,
      sceneId,
      name,
      boundary: [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height },
      ],
      label: { x: x + width / 2, y: y + 3 },
    };
  }
  const regions = [
    region("region-meeting", "floor-10", "会议区", 33, 15, 34, 29),
    region("region-machine", "floor-10", "设备间禁入范围", 68, 15, 25, 29),
    region("region-office", "floor-10", "办公值守区", 8, 15, 24, 29),
    region("region-workshop", OUTDOOR_SCENE_ID, "装置区警戒范围", 31, 51, 20, 29),
    region("region-tank", OUTDOOR_SCENE_ID, "罐区巡检范围", 59, 10, 30, 34),
  ];
  const locations = currentLocations(positioning);
  function alarm(id: string, personId: string | null, regionId: string, extra: Partial<PositionAlarm>): PositionAlarm {
    const area = regions.find((item) => item.id === regionId)!;
    const person = positioning.persons.find((item) => item.id === personId);
    const location = locations.find((item) => item.person.id === personId);
    return {
      id,
      type: "intrusion",
      level: 1,
      state: "pending",
      sceneId: area.sceneId,
      sceneName: area.sceneId === OUTDOOR_SCENE_ID ? OUTDOOR_SCENE_NAME : "数据对接楼 · 10层",
      regionId,
      regionName: area.name,
      personId,
      personName: person?.name ?? "",
      terminalId: location?.terminal.id ?? "",
      currentCount: null,
      ruleName: "",
      occurredAt: at(18),
      receivedAt: at(18),
      recoveredAt: null,
      closedAt: null,
      coordinate: location?.coordinate ? { ...location.coordinate } : { ...area.label },
      coordinateText: location ? positionCoordinateText(location.point) : "第三方事件未提供坐标，显示监控区域参考位置",
      positionAt: location?.point.at ?? null,
      trigger: "",
      actualValue: "",
      assignee: "",
      operations: [],
      ...extra,
    };
  }
  return {
    regions,
    alarms: [
      alarm("AL-20260908-001", "P20260002", "region-meeting", {
        type: "timeout",
        ruleName: "会议区停留超时",
        trigger: "允许停留时长：60分钟",
        actualValue: "第三方上报人员停留时长：78分钟",
      }),
      alarm("AL-20260908-002", null, "region-meeting", {
        type: "overcrowding",
        level: 2,
        state: "processing",
        currentCount: 12,
        ruleName: "会议区人数上限",
        occurredAt: at(22),
        receivedAt: at(22),
        trigger: "区域人数上限：10人",
        actualValue: "事件发生时当前人数：12人",
        assignee: "安保值班员",
        operations: [
          {
            id: "operation-seed-confirm",
            action: "confirm",
            at: at(20),
            operator: "值班管理员",
            opinion: "已核实区域人数异常",
            assignee: "",
          },
          {
            id: "operation-seed-assign",
            action: "assign",
            at: at(19),
            operator: "值班管理员",
            opinion: "请前往现场疏导",
            assignee: "安保值班员",
          },
        ],
      }),
      alarm("AL-20260908-003", "P20260001", "region-office", {
        type: "sos",
        occurredAt: at(3),
        receivedAt: at(3),
        trigger: "定位终端 SOS 按键主动触发",
        actualValue: "终端上报一键求救事件",
      }),
      alarm("AL-20260908-004", "P20260007", "region-workshop", {
        type: "intrusion",
        occurredAt: at(6),
        receivedAt: at(6),
        ruleName: "装置区禁止进入",
        trigger: "规则适用人员进入监控区域",
        actualValue: "第三方定位引擎上报区域入侵",
      }),
      alarm("AL-20260908-005", "P20260005", "region-machine", {
        type: "intrusion",
        state: "recovered",
        occurredAt: at(40),
        receivedAt: at(40),
        recoveredAt: at(30),
        ruleName: "设备间禁止进入",
        trigger: "规则适用人员进入监控区域",
        actualValue: "触发条件已消失",
      }),
      alarm("AL-20260907-006", "P20260001", "region-meeting", {
        type: "sos",
        state: "closed",
        occurredAt: "2026-09-07T00:40:00.000Z",
        receivedAt: "2026-09-07T00:40:02.000Z",
        closedAt: "2026-09-07T00:48:00.000Z",
        positionAt: "2026-09-07T00:40:00.000Z",
        coordinate: { x: 57, y: 37 },
        coordinateText: "X 57.00 m，Y 37.00 m",
        trigger: "定位终端 SOS 按键主动触发",
        actualValue: "终端上报一键求救事件",
        assignee: "值班管理员",
        operations: [
          {
            id: "history-false-alarm",
            action: "falseAlarm",
            at: "2026-09-07T00:48:00.000Z",
            operator: "值班管理员",
            opinion: "现场核实为误触，已关闭告警",
            assignee: "",
          },
        ],
      }),
    ],
  };
}
