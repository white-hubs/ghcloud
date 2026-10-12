export const PERSON_SOURCES = {
  organization: { label: "组织管理", personType: "员工", color: "blue", available: true },
  contractor: { label: "承包商管理", personType: "承包商", color: "orange", available: false },
  visitor: { label: "访客管理", personType: "访客", color: "green", available: false },
} as const;

export const DEVICE_KINDS = { terminal: "定位终端", station: "定位基站", gateway: "定位网关" } as const;
export const POSITIONING_DEVICE_TYPES = { terminal: "TERMINAL", station: "BASE_STATION" } as const;
export const DEVICE_TYPES = {
  terminal: { label: "定位终端", kind: "terminal" },
  station: { label: "定位基站", kind: "station" },
  card: { label: "定位卡", kind: "terminal" },
  wristband: { label: "定位手环", kind: "terminal" },
  helmet: { label: "安全帽标签", kind: "terminal" },
  explosionProof: { label: "防爆定位卡", kind: "terminal" },
  indoor: { label: "室内基站", kind: "station" },
  outdoor: { label: "室外基站", kind: "station" },
  gateway: { label: "定位网关", kind: "gateway" },
  edgeGateway: { label: "边缘定位网关", kind: "gateway" },
} as const;
export const ONLINE_STATES = {
  online: { label: "在线", color: "green" },
  offline: { label: "离线", color: "default" },
  pending: { label: "待上线", color: "orange" },
} as const;
export const BINDING_STATES = { bound: "已绑定", unbound: "未绑定" } as const;
export const REPLACEMENT_REASONS = {
  deviceFailure: "设备故障",
  insufficientBatteryLife: "电量续航不足",
  wearableDamage: "佩戴损坏",
  workAdjustment: "人员作业调整",
  other: "其他",
} as const;
export const UNBIND_REASONS = {
  personnelAdjustment: "人员调整",
  terminalFailure: "终端故障",
  temporarilyStopPositioning: "暂时停止定位",
  other: "其他",
} as const;
export const BINDING_REASON_LABELS = { ...REPLACEMENT_REASONS, ...UNBIND_REASONS } as const;
export const ENABLE_STATES = { enabled: "启用", disabled: "停用" } as const;
export const GATEWAY_STATES = {
  running: { label: "运行中", color: "green" },
  undeployed: { label: "未部署", color: "orange" },
  disabled: { label: "停用", color: "default" },
} as const;
export const SYNC_STATES = {
  added: { label: "新增", color: "green" },
  updated: { label: "更新", color: "blue" },
  failed: { label: "失败", color: "red" },
} as const;
export const optionsOf = (labels: Record<string, string>) => Object.entries(labels).map(([value, label]) => ({ value, label }));
export const SOURCE_OPTIONS = Object.entries(PERSON_SOURCES)
  .filter(([, item]) => item.available)
  .map(([value, item]) => ({ value, label: item.label }));
export const PERSON_TYPE_OPTIONS = Object.entries(PERSON_SOURCES)
  .filter(([, item]) => item.available)
  .map(([value, item]) => ({ value, label: item.personType }));
export const ONLINE_OPTIONS = [
  { value: "online", label: ONLINE_STATES.online.label },
  { value: "offline", label: ONLINE_STATES.offline.label },
];
export const GATEWAY_STATE_OPTIONS = Object.entries(GATEWAY_STATES).map(([value, item]) => ({ value, label: item.label }));
export const deviceTypeOptions = (kind: keyof typeof DEVICE_KINDS) =>
  Object.entries(DEVICE_TYPES)
    .filter(([, item]) => item.kind === kind)
    .map(([value, item]) => ({ value, label: item.label }));
