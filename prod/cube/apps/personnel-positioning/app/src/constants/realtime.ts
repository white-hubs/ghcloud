export const OUTDOOR_SCENE_ID = "outdoor";
export const OUTDOOR_SCENE_NAME = "园区室外地图";
// 演示园区范围；正式项目由地图中心提供。
export const OUTDOOR_BOUNDS = { west: 120.15, east: 120.16, south: 30.27, north: 30.276 };
export const LOCATION_FILTERS = {
  all: { label: "当前定位人数", color: "blue" },
  online: { label: "在线人数", color: "green" },
  offline: { label: "离线人数", color: "default" },
  alarm: { label: "告警人数", color: "red" },
} as const;
export const ALARM_TYPES = {
  intrusion: "区域入侵",
  timeout: "区域超时",
  leave: "禁止离开",
  overcrowding: "区域超员",
  understaffing: "区域缺员",
  gathering: "人员聚集",
  sos: "SOS一键求救",
} as const;
export const ALARM_LEVELS = {
  1: { label: "一级", color: "red", stroke: "#f5222d" },
  2: { label: "二级", color: "orange", stroke: "#fa8c16" },
  3: { label: "三级", color: "blue", stroke: "#1890ff" },
} as const;
export const ALARM_STATES = {
  pending: { label: "待确认", color: "red" },
  confirmed: { label: "已确认", color: "orange" },
  processing: { label: "处置中", color: "blue" },
  recovered: { label: "已恢复", color: "green" },
  closed: { label: "已关闭", color: "default" },
} as const;
export const ALARM_ACTIONS = {
  confirm: "确认告警",
  falseAlarm: "标记误报",
  assign: "指派处置",
  progress: "更新进展",
  close: "关闭告警",
} as const;

export const ALARM_OPINION_MAX_LENGTH = 500;
export const ALARM_ATTACHMENT_MAX_COUNT = 5;
export const ALARM_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
export const ALARM_ATTACHMENT_ACCEPT = ".png,.jpg,.jpeg,.pdf";
