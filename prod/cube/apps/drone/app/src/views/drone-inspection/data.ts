import type { DroneDetailModel, NestDetailModel, TrackDetailModel } from "@ghcloud/cube-drone-service";

export type AlertSource = "cruise" | "point";
export type AlertStatus = "pending" | "processing" | "resolved";
export type InspectionObjectStatus = "normal" | "warning" | "alert";

export interface DroneAlert {
  id: string;
  time: string;
  type: string;
  confidence: number;
  source: AlertSource;
  location: string;
  gps?: {
    lat: number;
    lng: number;
  };
  image: string;
  status: AlertStatus;
  handleRecord?: string;
}

export interface TodayInspectionTask {
  id: string;
  name: string;
  time: string;
  status: "running" | "completed";
  currentWaypoint: number;
  totalWaypoints: number;
}

export interface DroneOverviewStats {
  normalObjectCount: number;
  warningObjectCount: number;
  runningTaskCount: number;
  completedTaskCount: number;
}

export interface DroneOverviewMock {
  alerts: DroneAlert[];
  todayInspectionTasks: TodayInspectionTask[];
  stats: DroneOverviewStats;
}

export interface InspectionObject {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  status: InspectionObjectStatus;
  type?: string;
  area?: string;
  algorithm?: string;
  owner?: string;
  updateTime?: string;
}

export interface InspectionRoute {
  id: string;
  name: string;
  nestName: string;
  objectCount: number;
  waypointCount: number;
  distance: string;
  duration: string;
  status: "enabled" | "disabled";
  updateTime: string;
}

export interface InspectionPlan {
  id: string;
  name: string;
  routeName: string;
  planType: "once" | "cycle";
  cycle: string;
  nextTime: string;
  status: "enabled" | "disabled";
  objectCount: number;
}

export interface AiRecognitionItem {
  id: string;
  name: string;
  type: string;
  algorithm: string;
  threshold: number;
  status: "enabled" | "disabled";
  lastTrainTime: string;
}

export interface InspectionReport {
  id: string;
  name: string;
  routeName: string;
  executeTime: string;
  droneName: string;
  objectCount: number;
  alertCount: number;
  status: "normal" | "abnormal";
}

export const nests: NestDetailModel[] = [
  {
    nestSn: "NEST001",
    nestName: "1号机巢",
    online: true,
    temperature: 22,
    humidity: 55,
    chargeStatus: false,
    doorStatus: false,
    smoke: false,
    longitude: 114.362,
    latitude: 30.522,
  },
  {
    nestSn: "NEST002",
    nestName: "2号机巢",
    online: true,
    temperature: 23,
    humidity: 58,
    chargeStatus: false,
    doorStatus: false,
    smoke: false,
    longitude: 114.372,
    latitude: 30.528,
  },
];

export const drones: DroneDetailModel[] = [
  {
    droneSn: "DRONE001",
    name: "巡检机01",
    nestSn: "NEST001",
    nestName: "1号机巢",
    online: true,
    status: "flying_auto",
    batteryCharge: 78,
    signal: 85,
    gpsStars: 12,
    latitude: 30.526,
    longitude: 114.368,
    altitude: 45,
    speed: 3.2,
    yaw: 15.2,
    pitch: -5,
    roll: 2.1,
  },
  {
    droneSn: "DRONE002",
    name: "巡检机02",
    nestSn: "NEST002",
    nestName: "2号机巢",
    online: false,
    status: "standby",
    batteryCharge: 96,
    signal: 92,
    gpsStars: 10,
    latitude: 30.528,
    longitude: 114.372,
    altitude: 0,
    speed: 0,
    yaw: 0,
    pitch: 0,
    roll: 0,
  },
];

export const inspectionObjects: InspectionObject[] = [
  {
    id: "O001",
    name: "周界东段",
    longitude: 114.368,
    latitude: 30.524,
    status: "warning",
    type: "周界",
    area: "东侧围墙",
    algorithm: "人员闯入",
    owner: "安防部",
    updateTime: "2026-06-01 10:21:33",
  },
  {
    id: "O002",
    name: "4号罐区",
    longitude: 114.358,
    latitude: 30.52,
    status: "alert",
    type: "罐区",
    area: "储油区",
    algorithm: "泄漏识别",
    owner: "设备部",
    updateTime: "2026-06-01 09:50:12",
  },
  {
    id: "O003",
    name: "1号库区",
    longitude: 114.365,
    latitude: 30.531,
    status: "normal",
    type: "粮仓",
    area: "一号库",
    algorithm: "仓顶异常",
    owner: "仓储部",
    updateTime: "2026-06-01 08:30:00",
  },
  {
    id: "O004",
    name: "管廊北段",
    longitude: 114.374,
    latitude: 30.519,
    status: "normal",
    type: "管廊",
    area: "北侧管廊",
    algorithm: "烟火识别",
    owner: "设备部",
    updateTime: "2026-06-01 08:10:00",
  },
];

export const trackDetail: TrackDetailModel = {
  taskLogId: "TASKLOG001",
  trackName: "1号库区日常巡检",
  currentWaypoint: 13,
  totalWaypoints: 21,
  points: [
    { id: "W01", longitude: 114.358, latitude: 30.52, waypointType: "waypoint" },
    { id: "W02", longitude: 114.362, latitude: 30.522, waypointType: "inspect" },
    { id: "W03", longitude: 114.368, latitude: 30.524, waypointType: "observe" },
    { id: "W04", longitude: 114.372, latitude: 30.528, waypointType: "inspect" },
    { id: "W05", longitude: 114.374, latitude: 30.519, waypointType: "waypoint" },
  ],
};

export const alerts: DroneAlert[] = [
  {
    id: "A001",
    time: "2026-06-01 10:23:15",
    type: "疑似烟火",
    confidence: 91,
    source: "cruise",
    location: "GPS(30.50,114.58)",
    gps: { lat: 30.5, lng: 114.58 },
    image: "火情抓拍",
    status: "pending",
  },
  {
    id: "A002",
    time: "2026-06-01 10:21:33",
    type: "人员闯入",
    confidence: 84,
    source: "point",
    location: "周界东段",
    image: "闯入抓拍",
    status: "processing",
    handleRecord: "已派安保人员前往",
  },
  {
    id: "A003",
    time: "2026-06-01 09:50:12",
    type: "泄漏",
    confidence: 88,
    source: "point",
    location: "4号罐区",
    image: "泄漏抓拍",
    status: "resolved",
    handleRecord: "张工派单→现场确认阀门渗漏→已更换垫片",
  },
];

export const todayInspectionTasks: TodayInspectionTask[] = [
  { id: "T001", name: "1号库区日常巡检", time: "06:00", status: "running", currentWaypoint: 13, totalWaypoints: 21 },
  { id: "T002", name: "周界巡检", time: "08:30", status: "completed", currentWaypoint: 8, totalWaypoints: 8 },
  { id: "T003", name: "管廊巡检", time: "10:00", status: "completed", currentWaypoint: 5, totalWaypoints: 5 },
];

export const droneOverviewMockMap: Record<string, DroneOverviewMock> = {
  DRONE001: {
    alerts,
    todayInspectionTasks,
    stats: {
      normalObjectCount: 2,
      warningObjectCount: 1,
      runningTaskCount: 1,
      completedTaskCount: 2,
    },
  },
  DRONE002: {
    alerts: [
      {
        id: "A201",
        time: "2026-06-01 08:41:18",
        type: "仓顶异常",
        confidence: 76,
        source: "point",
        location: "2号库区北侧仓顶",
        gps: { lat: 30.529, lng: 114.373 },
        image: "仓顶抓拍",
        status: "resolved",
        handleRecord: "复核为遮挡物，已清理",
      },
    ],
    todayInspectionTasks: [
      { id: "T201", name: "2号库区待命巡检", time: "07:30", status: "completed", currentWaypoint: 10, totalWaypoints: 10 },
      { id: "T202", name: "设备间复核巡检", time: "11:00", status: "completed", currentWaypoint: 6, totalWaypoints: 6 },
    ],
    stats: {
      normalObjectCount: 3,
      warningObjectCount: 0,
      runningTaskCount: 0,
      completedTaskCount: 2,
    },
  },
};

export const handleRecords = [
  {
    id: "R001",
    time: "09:50",
    type: "泄漏",
    location: "4号罐区",
    flow: "张工派单→现场确认阀门渗漏→更换垫片→已闭环",
    status: "已闭环",
  },
  {
    id: "R002",
    time: "10:05",
    type: "烟火",
    location: "GPS(30.50,114.58)",
    flow: "接管核实→确认为误报(反光)→标注误报→已闭环",
    status: "已闭环",
  },
  {
    id: "R003",
    time: "10:21",
    type: "闯入",
    location: "周界东段",
    flow: "已派安保人员前往→现场确认",
    status: "处置中",
  },
];

export const inspectionRoutes: InspectionRoute[] = [
  {
    id: "R001",
    name: "1号库区日常巡检",
    nestName: "1号机巢",
    objectCount: 8,
    waypointCount: 21,
    distance: "2.4km",
    duration: "18min",
    status: "enabled",
    updateTime: "2026-06-01 09:20:00",
  },
  {
    id: "R002",
    name: "周界巡检",
    nestName: "1号机巢",
    objectCount: 6,
    waypointCount: 8,
    distance: "1.6km",
    duration: "12min",
    status: "enabled",
    updateTime: "2026-05-30 15:40:00",
  },
  {
    id: "R003",
    name: "管廊巡检",
    nestName: "2号机巢",
    objectCount: 5,
    waypointCount: 5,
    distance: "0.9km",
    duration: "8min",
    status: "disabled",
    updateTime: "2026-05-29 11:12:00",
  },
];

export const inspectionPlans: InspectionPlan[] = [
  {
    id: "P001",
    name: "早班库区巡检",
    routeName: "1号库区日常巡检",
    planType: "cycle",
    cycle: "每天 06:00",
    nextTime: "2026-06-12 06:00:00",
    status: "enabled",
    objectCount: 8,
  },
  {
    id: "P002",
    name: "周界夜间巡检",
    routeName: "周界巡检",
    planType: "cycle",
    cycle: "每天 22:30",
    nextTime: "2026-06-11 22:30:00",
    status: "enabled",
    objectCount: 6,
  },
  {
    id: "P003",
    name: "管廊临时复核",
    routeName: "管廊巡检",
    planType: "once",
    cycle: "单次",
    nextTime: "2026-06-12 10:00:00",
    status: "disabled",
    objectCount: 5,
  },
];

export const aiRecognitionItems: AiRecognitionItem[] = [
  {
    id: "AI001",
    name: "疑似烟火识别",
    type: "安全风险",
    algorithm: "fire-smoke-v2",
    threshold: 85,
    status: "enabled",
    lastTrainTime: "2026-05-28 16:00:00",
  },
  {
    id: "AI002",
    name: "人员闯入识别",
    type: "周界入侵",
    algorithm: "intrusion-v3",
    threshold: 80,
    status: "enabled",
    lastTrainTime: "2026-05-26 14:30:00",
  },
  {
    id: "AI003",
    name: "泄漏识别",
    type: "设备异常",
    algorithm: "leak-v1",
    threshold: 82,
    status: "enabled",
    lastTrainTime: "2026-05-20 09:10:00",
  },
  {
    id: "AI004",
    name: "仓顶异常识别",
    type: "仓储风险",
    algorithm: "roof-abnormal-v1",
    threshold: 78,
    status: "disabled",
    lastTrainTime: "2026-05-18 10:20:00",
  },
];

export const inspectionReports: InspectionReport[] = [
  {
    id: "REP001",
    name: "1号库区日常巡检报告",
    routeName: "1号库区日常巡检",
    executeTime: "2026-06-01 06:18:21",
    droneName: "巡检机01",
    objectCount: 8,
    alertCount: 1,
    status: "abnormal",
  },
  {
    id: "REP002",
    name: "周界巡检报告",
    routeName: "周界巡检",
    executeTime: "2026-06-01 08:42:10",
    droneName: "巡检机01",
    objectCount: 6,
    alertCount: 0,
    status: "normal",
  },
  {
    id: "REP003",
    name: "管廊巡检报告",
    routeName: "管廊巡检",
    executeTime: "2026-06-01 10:09:36",
    droneName: "巡检机02",
    objectCount: 5,
    alertCount: 1,
    status: "abnormal",
  },
];

export const alertTypeOptions = [
  { label: "全部", value: "" },
  { label: "烟火", value: "疑似烟火" },
  { label: "闯入", value: "人员闯入" },
  { label: "泄漏", value: "泄漏" },
  { label: "仓顶异常", value: "仓顶异常" },
  { label: "温度异常", value: "温度异常" },
];

export const alertSourceOptions = [
  { label: "全部", value: "" },
  { label: "巡航告警", value: "cruise" },
  { label: "点位告警", value: "point" },
];

export const alertStatusOptions = [
  { label: "全部", value: "" },
  { label: "待处理", value: "pending" },
  { label: "处置中", value: "processing" },
  { label: "已销项", value: "resolved" },
];

export const getAlertLevel = (confidence: number): "danger" | "warning" | "normal" => {
  if (confidence > 85) {
    return "danger";
  }
  if (confidence >= 70) {
    return "warning";
  }
  return "normal";
};

export const alertStatusTextMap: Record<AlertStatus, string> = {
  pending: "待处理",
  processing: "处置中",
  resolved: "已销项",
};

export const alertSourceTextMap: Record<AlertSource, string> = {
  cruise: "巡航告警",
  point: "点位告警",
};

export const droneStatusTextMap: Record<DroneDetailModel["status"], string> = {
  standby: "待命",
  flying_auto: "自动巡检中",
  manual: "手动接管中",
};
