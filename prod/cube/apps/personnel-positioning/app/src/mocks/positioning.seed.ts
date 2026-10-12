import { OUTDOOR_BOUNDS, OUTDOOR_SCENE_ID, OUTDOOR_SCENE_NAME } from "../constants/realtime";
import type { DeviceType, PositioningDevice, PositioningState, SourcePerson } from "../models/positioning";
import { addTrajectorySeed } from "./trajectory.seed";

export const MOCK_TIME = "2026-09-07T02:00:00.000Z";
const names = [
  "张伟",
  "李强",
  "王芳",
  "赵敏",
  "王建",
  "刘芳",
  "陈刚",
  "孙海",
  "周敏",
  "吴刚",
  "郑晓",
  "冯军",
  "马超",
  "钱进",
  "吴桐",
  "高原",
  "叶青",
  "许宁",
  "沈佳",
  "何平",
  "徐涛",
  "林晓",
  "罗成",
  "秦川",
  "宋雨",
  "唐欣",
  "邵阳",
  "杜峰",
  "白露",
  "方远",
];
const departments = ["生产一班", "维修班", "化验班", "仓储班", "动力班", "综合办"];
const posts = ["操作工", "维修工", "化验员", "仓库管理员", "电工", "安全员"];
const pad = (value: number): string => String(value).padStart(2, "0");

export const sourcePeople: SourcePerson[] = names.map((name, i) => ({
  sourceId: `EMP${String(i + 1).padStart(4, "0")}`,
  source: "organization",
  name,
  organization: departments[i % departments.length]!,
  post: posts[i % posts.length]!,
}));

const terminalTypes: DeviceType[] = ["card", "wristband", "helmet", "explosionProof"];
const terminalDevices: PositioningDevice[] = Array.from({ length: 34 }, (_, i) => ({
  id: `T202600${pad(i + 1)}`,
  kind: "terminal",
  type: terminalTypes[i % 4]!,
  model: ["UWB-C100", "UWB-W200", "UWB-H100", "UWB-EX100"][i % 4]!,
  vendor: "园区定位引擎",
  online: i % 9 === 8 ? "pending" : i % 5 === 4 ? "offline" : "online",
  battery: i % 9 === 8 ? null : Math.max(8, 100 - i * 3),
  enabled: i !== 22 && i !== 26,
  syncedAt: MOCK_TIME,
  lastSeenAt: i % 9 === 8 ? null : "2026-09-07T01:58:00.000Z",
  space: "",
  coordinate: "",
  gatewayState: null,
  linkedStationIds: [],
}));
const stationDevices: PositioningDevice[] = Array.from({ length: 9 }, (_, i) => ({
  id: `S202600${pad(i + 1)}`,
  kind: "station",
  type: i < 6 ? "indoor" : "outdoor",
  model: i < 6 ? "UWB-BS300" : "UWB-BS500",
  vendor: "园区定位引擎",
  online: i === 2 ? "offline" : "online",
  battery: null,
  enabled: i !== 5,
  syncedAt: MOCK_TIME,
  lastSeenAt: MOCK_TIME,
  space: i < 6 ? `生产楼 · ${Math.floor(i / 2) + 1}F` : "园区室外地图",
  coordinate: i < 6 ? `X: ${12 + i * 6}.00 m, Y: ${8 + i * 4}.00 m` : `经度 120.${1500 + i * 12}°, 纬度 30.${2700 + i * 9}°`,
  gatewayState: null,
  linkedStationIds: [],
}));
const gatewayDevices: PositioningDevice[] = [
  {
    id: "GW-001",
    kind: "gateway",
    type: "edgeGateway",
    model: "EDGE-GW200",
    vendor: "园区定位引擎",
    online: "online",
    battery: null,
    enabled: true,
    syncedAt: MOCK_TIME,
    lastSeenAt: "2026-09-07T01:59:30.000Z",
    space: "一号车间 · 弱电间",
    coordinate: "",
    gatewayState: "running",
    linkedStationIds: ["S20260001", "S20260002", "S20260003", "S20260004"],
  },
  {
    id: "GW-002",
    kind: "gateway",
    type: "gateway",
    model: "LOC-GW100",
    vendor: "园区定位引擎",
    online: "offline",
    battery: null,
    enabled: true,
    syncedAt: MOCK_TIME,
    lastSeenAt: "2026-09-07T01:54:00.000Z",
    space: "罐区 · 控制室",
    coordinate: "",
    gatewayState: "running",
    linkedStationIds: ["S20260005", "S20260006", "S20260007"],
  },
  {
    id: "GW-003",
    kind: "gateway",
    type: "gateway",
    model: "LOC-GW100",
    vendor: "本地维护",
    online: "pending",
    battery: null,
    enabled: true,
    syncedAt: MOCK_TIME,
    lastSeenAt: null,
    space: "设备库",
    coordinate: "",
    gatewayState: "undeployed",
    linkedStationIds: [],
  },
];
export const providerDevices = [...terminalDevices, ...stationDevices, ...gatewayDevices];

export function createPositioningSeed(): PositioningState {
  const persons = sourcePeople.slice(0, 24).map((person, i) => ({ ...person, id: `P202600${pad(i + 1)}`, syncedAt: MOCK_TIME }));
  // 保留后续来源的既有档案例子；获取弹窗仅开放已接入的组织管理。
  persons[4] = { ...persons[4]!, source: "contractor", sourceId: "CON0001", organization: "安装项目组", post: "焊工" };
  persons[5] = { ...persons[5]!, source: "visitor", sourceId: "VIS0001", organization: "设备供应商", post: "—" };
  const bindings = persons.slice(0, 12).map((person, i) => ({
    id: `binding-${i + 1}`,
    personId: person.id,
    terminalId: `T202600${pad(i + 1)}`,
    startedAt: "2026-09-01T00:00:00.000Z",
    endedAt: i === 11 ? "2026-09-06T10:00:00.000Z" : null,
    action: "bind" as const,
    actionReason: null,
    endAction: i === 11 ? ("unbind" as const) : null,
    endReason: i === 11 ? ("personnelAdjustment" as const) : null,
    operator: "设备管理员",
  }));
  const positions = bindings.flatMap((binding, personIndex) => {
    const outdoor = personIndex >= 6 && personIndex <= 9;
    const sceneId = outdoor ? OUTDOOR_SCENE_ID : personIndex === 10 ? "floor-09" : "floor-10";
    const destinations = [
      [20, 30],
      [48, 30],
      [57, 37],
      [119, 44],
      [83, 28],
      [37, 71],
      [40, 63],
      [67, 38],
      [80, 72],
      [65, 66],
      [26, 45],
      [70, 50],
    ];
    const [endX, endY] = destinations[personIndex]!;
    return Array.from({ length: 8 }, (_, i) => ({
      terminalId: binding.terminalId,
      at: new Date(Date.parse(personIndex === 11 ? "2026-09-06T01:00:00.000Z" : "2026-09-07T01:00:00.000Z") + i * 8 * 60000).toISOString(),
      sceneId,
      scene: outdoor ? OUTDOOR_SCENE_NAME : `数据对接楼 · ${personIndex === 10 ? "9层" : "10层"}`,
      x: endX! - (7 - i) * 2,
      y: endY! - (7 - i),
      ...(outdoor
        ? {
            longitude: OUTDOOR_BOUNDS.west + ((endX! - (7 - i) * 2) / 100) * (OUTDOOR_BOUNDS.east - OUTDOOR_BOUNDS.west),
            latitude: OUTDOOR_BOUNDS.north - ((endY! - (7 - i)) / 100) * (OUTDOOR_BOUNDS.north - OUTDOOR_BOUNDS.south),
          }
        : {}),
    }));
  });
  const devices = structuredClone([...terminalDevices.slice(0, 32), ...stationDevices.slice(0, 8), ...gatewayDevices]);
  const state: PositioningState = {
    persons,
    devices,
    bindings,
    positions,
    syncRecords: devices.map((device, i) => ({
      id: `sync-seed-${i}`,
      deviceId: device.id,
      kind: device.kind,
      at: MOCK_TIME,
      status: "added",
      message: "首次同步设备档案",
    })),
  };
  addTrajectorySeed(state);
  return state;
}
