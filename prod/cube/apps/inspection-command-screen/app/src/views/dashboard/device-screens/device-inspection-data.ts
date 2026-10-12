export type DeviceInspectionMode = "drone" | "robotDog";
export type DeviceTaskStatus = "待巡检" | "巡检中" | "已巡检" | "已终止" | "已超时";
export type RoutePointStatus = "done" | "pending" | "abnormal";

export interface DeviceInfoMetric {
  label: string;
  value: string;
  accent?: "success" | "warning" | "danger" | "primary";
}

export interface DeviceInfoItem {
  id: string;
  name: string;
  model: string;
  status: "在线" | "离线";
  badge: string;
  metrics: DeviceInfoMetric[];
  details: DeviceInfoMetric[];
}

export interface RoutePointItem {
  id: string;
  name: string;
  lng: number;
  lat: number;
  heightText: string;
  timeText: string;
  result: "正常" | "异常" | "--";
  status: RoutePointStatus;
}

export interface DeviceInspectionTask {
  id: string;
  mode: DeviceInspectionMode;
  name: string;
  deviceId: string;
  deviceName: string;
  routeName: string;
  level: "紧急" | "常规";
  status: DeviceTaskStatus;
  objectCount: number;
  donePointCount: number;
  totalPointCount: number;
  beginTime: string;
  endTime: string;
  description: string;
  routePoints: RoutePointItem[];
  hazardDefaultLocation?: {
    locationName: string;
    longitude: number | null;
    latitude: number | null;
  };
}

export interface DeviceTaskDayStat {
  date: string;
  done: number;
  running: number;
  pending: number;
}

export const droneDevices: DeviceInfoItem[] = [
  {
    id: "drone-001",
    name: "无人机设备",
    model: "大疆 M300 RTK",
    status: "在线",
    badge: "运行中",
    metrics: [
      { label: "电量", value: "62%", accent: "warning" },
      { label: "高度", value: "85 m", accent: "primary" },
      { label: "速度", value: "6.2 m/s", accent: "success" },
      { label: "信号", value: "良好", accent: "success" },
      { label: "累计任务", value: "47次" },
      { label: "累计里程", value: "856 km" },
    ],
    details: [
      { label: "机巢", value: "1号机巢" },
      { label: "GPS星数", value: "18颗" },
      { label: "姿态Y/P/R", value: "15.2 / -5 / 2.1" },
      { label: "经纬度", value: "114.3680, 30.5260" },
    ],
  },
];

export const robotDogDevices: DeviceInfoItem[] = [
  {
    id: "dog-001",
    name: "Unitree B2-001",
    model: "Unitree B2",
    status: "在线",
    badge: "运行中",
    metrics: [
      { label: "电量", value: "78%", accent: "success" },
      { label: "模式", value: "站立", accent: "primary" },
      { label: "高度(Z)", value: "0.35m" },
      { label: "位置", value: "X:0.00 Y:0.00" },
      { label: "累计任务", value: "18次" },
      { label: "累计里程", value: "42 km" },
    ],
    details: [
      { label: "设备状态", value: "在线", accent: "success" },
      { label: "运行时长", value: "95h" },
      { label: "当前模式", value: "站立" },
      { label: "控制方式", value: "远程控制" },
    ],
  },
];

const route = (prefix: string, isDog: boolean): RoutePointItem[] => [
  {
    id: `${prefix}-1`,
    name: isDog ? "厂区大门" : "厂区周界-东段",
    lng: 104.0528,
    lat: 30.5858,
    heightText: isDog ? "厂区大门" : "50m",
    timeText: isDog ? "08:10" : "06:05",
    result: "正常",
    status: "done",
  },
  {
    id: `${prefix}-2`,
    name: isDog ? "消防通道" : "厂区周界-南段",
    lng: 104.0561,
    lat: 30.5874,
    heightText: isDog ? "消防通道" : "65m",
    timeText: isDog ? "08:18" : "06:08",
    result: "正常",
    status: "done",
  },
  {
    id: `${prefix}-3`,
    name: isDog ? "危化品仓库入口" : "厂区周界-西段",
    lng: 104.0592,
    lat: 30.5891,
    heightText: isDog ? "危化品仓库入口" : "70m",
    timeText: isDog ? "08:23" : "06:12",
    result: "异常",
    status: "abnormal",
  },
  {
    id: `${prefix}-4`,
    name: isDog ? "配电室周边" : "厂区周界-北段",
    lng: 104.0615,
    lat: 30.5866,
    heightText: isDog ? "配电室周边" : "55m",
    timeText: "--",
    result: "--",
    status: "pending",
  },
];

export const droneTasks: DeviceInspectionTask[] = [
  {
    id: "drone-task-001",
    mode: "drone",
    name: "厂区周界无人机巡检",
    deviceId: "drone-001",
    deviceName: "无人机设备",
    routeName: "厂区周界巡检",
    level: "紧急",
    status: "巡检中",
    objectCount: 15,
    donePointCount: 3,
    totalPointCount: 5,
    beginTime: "2026-06-26 06:00",
    endTime: "2026-06-26 06:40",
    description: "无人机按预设航线自动执行厂区周界空中巡检，AI 自动拍照识别标准项。",
    routePoints: route("drone-route-a", false),
  },
  {
    id: "drone-task-002",
    mode: "drone",
    name: "仓储区红外扫描",
    deviceId: "drone-001",
    deviceName: "无人机设备",
    routeName: "仓储区红外扫描",
    level: "常规",
    status: "已巡检",
    objectCount: 8,
    donePointCount: 3,
    totalPointCount: 3,
    beginTime: "2026-06-25 05:00",
    endTime: "2026-06-25 05:30",
    description: "无人机红外扫描仓储区，检测温度异常区域。",
    routePoints: route("drone-route-b", false).slice(0, 3),
  },
];

export const robotDogTasks: DeviceInspectionTask[] = [
  {
    id: "dog-task-001",
    mode: "robotDog",
    name: "厂区地面机器狗巡检",
    deviceId: "dog-001",
    deviceName: "Unitree B2-001",
    routeName: "厂区地面巡检路线A",
    level: "常规",
    status: "巡检中",
    objectCount: 6,
    donePointCount: 3,
    totalPointCount: 6,
    beginTime: "2026-06-27 08:00",
    endTime: "2026-06-27 09:00",
    description: "机器狗沿预设地面路线自动行进巡检，AI 自动拍照识别地面巡检项。",
    routePoints: route("dog-route-a", true),
  },
  {
    id: "dog-task-002",
    mode: "robotDog",
    name: "仓库区地面机器狗巡检",
    deviceId: "dog-001",
    deviceName: "Unitree B2-001",
    routeName: "仓库区地面巡检路线B",
    level: "常规",
    status: "待巡检",
    objectCount: 4,
    donePointCount: 2,
    totalPointCount: 4,
    beginTime: "2026-06-28 07:00",
    endTime: "2026-06-28 08:00",
    description: "机器狗对仓库区地面路线进行自动巡检，检测地面异物与围栏完整性。",
    routePoints: route("dog-route-b", true),
  },
];

export const droneTaskDayStats: DeviceTaskDayStat[] = [
  { date: "06-24", done: 2, running: 1, pending: 1 },
  { date: "06-25", done: 3, running: 0, pending: 1 },
  { date: "06-26", done: 1, running: 2, pending: 2 },
];

export const robotDogTaskDayStats: DeviceTaskDayStat[] = [
  { date: "06-26", done: 1, running: 1, pending: 2 },
  { date: "06-27", done: 2, running: 1, pending: 1 },
  { date: "06-28", done: 0, running: 1, pending: 3 },
];
