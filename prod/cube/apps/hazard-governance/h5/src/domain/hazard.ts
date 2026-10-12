export type HazardLevel = "normal" | "major" | "critical";
export type HazardStatus = "pendingConfirm" | "pendingApproval" | "plan" | "rectifying" | "pendingAcceptance" | "closed" | "falseAlarm";
export type HazardSource = "ai" | "manual";
export type TaskStatus = "plan" | "approval" | "rectifying" | "check" | "closed";

export interface HazardRecord {
  id: string;
  title: string;
  description: string;
  level: HazardLevel;
  status: HazardStatus;
  source: HazardSource;
  sourceName: string;
  location: string;
  type: string;
  riskUnit: string;
  riskObject: string;
  reporter: string;
  foundAt: string;
  rectifier: string;
  acceptor: string;
  deadline: string;
  overdueDays: number;
  progress: number;
  aiAdvice: string;
}

export interface ApprovalRecord {
  id: string;
  hazardId: string;
  title: string;
  level: HazardLevel;
  applicant: string;
  submittedAt: string;
  overdue: boolean;
  currentNode: string;
}

export interface AcceptanceRecord {
  hazardId: string;
  title: string;
  level: HazardLevel;
  rectifier: string;
  submittedAt: string;
  overdue: boolean;
}

export const levelText: Record<HazardLevel, string> = {
  normal: "一般",
  major: "重大",
  critical: "特重大",
};

export const statusText: Record<HazardStatus, string> = {
  pendingConfirm: "待确认",
  pendingApproval: "待审批",
  plan: "待填写",
  rectifying: "整改中",
  pendingAcceptance: "待验收",
  closed: "已闭环",
  falseAlarm: "误报",
};

export const taskStatusText: Record<TaskStatus, string> = {
  plan: "待填写",
  approval: "待审批",
  rectifying: "整改中",
  check: "待验收",
  closed: "已闭环",
};

export const hazards: HazardRecord[] = [
  {
    id: "HZ-20260610-005",
    title: "消防通道占用",
    description: "B区2F消防通道堆积杂物，通行宽度不足1.2m。",
    level: "normal",
    status: "pendingConfirm",
    source: "ai",
    sourceName: "AI识别",
    location: "B区2F东侧走廊",
    type: "消防通道占用",
    riskUnit: "冷库B区",
    riskObject: "消防通道#01",
    reporter: "AI巡检系统",
    foundAt: "2026-06-10 14:23",
    rectifier: "张建国",
    acceptor: "赵六",
    deadline: "2026-06-17 18:00",
    overdueDays: 0,
    progress: 0,
    aiAdvice: "清理通道杂物，设置禁占标识，并纳入每日巡检点位。",
  },
  {
    id: "HZ-20260611-012",
    title: "危化品仓库通风系统故障",
    description: "危化品仓库通风系统停止运行，仓内可燃气体浓度升高。",
    level: "major",
    status: "pendingApproval",
    source: "manual",
    sourceName: "人工上报",
    location: "C区危化品仓库",
    type: "通风系统故障",
    riskUnit: "危化品仓库B区",
    riskObject: "通风系统#02",
    reporter: "张工",
    foundAt: "2026-06-11 09:45",
    rectifier: "李四",
    acceptor: "王磊",
    deadline: "2026-06-14 18:00",
    overdueDays: 0,
    progress: 20,
    aiAdvice: "立即停用异常区域，复核风机控制柜与可燃气体浓度，提交专项整改方案。",
  },
  {
    id: "HZ-20260605-003",
    title: "储罐区防静电接地整改",
    description: "储罐区接地线老化，接地夹接触不良。",
    level: "major",
    status: "rectifying",
    source: "manual",
    sourceName: "人工上报",
    location: "储罐区东侧",
    type: "防静电接地异常",
    riskUnit: "储罐区",
    riskObject: "接地线#05",
    reporter: "李工",
    foundAt: "2026-06-05 08:15",
    rectifier: "钱七",
    acceptor: "赵六",
    deadline: "2026-06-10 18:00",
    overdueDays: 2,
    progress: 45,
    aiAdvice: "更换老化接地线，补充接地电阻检测记录，整改期间加强作业监护。",
  },
  {
    id: "HZ-20260608-004",
    title: "配电间线路老化更换整改",
    description: "配电间2号柜出线电缆绝缘层破损，存在短路风险。",
    level: "major",
    status: "pendingAcceptance",
    source: "manual",
    sourceName: "人工上报",
    location: "D区配电间2号柜",
    type: "用电安全",
    riskUnit: "配电间",
    riskObject: "2号配电柜",
    reporter: "陈安",
    foundAt: "2026-06-08 08:15",
    rectifier: "周九",
    acceptor: "赵六",
    deadline: "2026-06-20 18:00",
    overdueDays: 0,
    progress: 100,
    aiAdvice: "更换破损电缆并补装防护套管，整改后上传前后对比照片。",
  },
  {
    id: "HZ-20260608-003",
    title: "电线老化/裸露",
    description: "配电间线路老化短路风险，已更换全部老化电缆。",
    level: "major",
    status: "closed",
    source: "manual",
    sourceName: "人工上报",
    location: "D区配电间2号柜",
    type: "电气安全",
    riskUnit: "配电间",
    riskObject: "出线电缆",
    reporter: "李工",
    foundAt: "2026-06-08 08:15",
    rectifier: "周九",
    acceptor: "赵六",
    deadline: "2026-06-10 18:00",
    overdueDays: 0,
    progress: 100,
    aiAdvice: "复训临时用电规范，固化配电柜巡检表。",
  },
];

export const approvals: ApprovalRecord[] = [
  {
    id: "AP-20260610-001",
    hazardId: "HZ-20260610-005",
    title: "B区2F消防通道堆积杂物整改方案",
    level: "normal",
    applicant: "张三",
    submittedAt: "2026-06-10 15:30",
    overdue: false,
    currentNode: "安全总监",
  },
  {
    id: "AP-20260611-002",
    hazardId: "HZ-20260611-012",
    title: "危化品仓库通风系统修复方案",
    level: "major",
    applicant: "李四",
    submittedAt: "2026-06-09 10:15",
    overdue: true,
    currentNode: "安全总监",
  },
  {
    id: "AP-20260612-003",
    hazardId: "HZ-20260612-003",
    title: "车间安全标识缺失补充方案",
    level: "normal",
    applicant: "王五",
    submittedAt: "2026-06-12 08:45",
    overdue: false,
    currentNode: "安全部门负责人",
  },
];

export const acceptances: AcceptanceRecord[] = [
  {
    hazardId: "HZ-20260601-003",
    title: "受限空间作业未设置警示标识",
    level: "major",
    rectifier: "李伟",
    submittedAt: "2026-06-01",
    overdue: true,
  },
  {
    hazardId: "HZ-20260608-012",
    title: "消防通道堆放杂物",
    level: "normal",
    rectifier: "王芳",
    submittedAt: "2026-06-08",
    overdue: false,
  },
  {
    hazardId: "HZ-20260528-007",
    title: "高处作业未系挂安全带",
    level: "major",
    rectifier: "赵强",
    submittedAt: "2026-05-28",
    overdue: true,
  },
];

export const riskTypes = ["消防安全", "危化安全", "用电安全", "危险作业管理", "仓储安全"];
export const riskUnits = ["冷库A区", "冷库B区", "冷库C区", "危化品仓库B区", "储罐区"];
export const riskObjects = ["消防通道#01", "通风系统#02", "接地线#05", "2号配电柜", "应急洗眼器"];

export const getHazardById = (id?: string): HazardRecord => {
  return hazards.find((item) => item.id === id) ?? hazards[0];
};

export const getTaskStatus = (hazard: HazardRecord): TaskStatus => {
  if (hazard.status === "pendingConfirm") {
    return "plan";
  }
  if (hazard.status === "pendingApproval") {
    return "approval";
  }
  if (hazard.status === "pendingAcceptance") {
    return "check";
  }
  if (hazard.status === "closed") {
    return "closed";
  }
  return "rectifying";
};

export const todoGroups = [
  {
    key: "confirm",
    title: "待确认",
    action: "确认",
    routeName: "hazards",
    items: hazards.filter((item) => item.status === "pendingConfirm"),
  },
  {
    key: "approval",
    title: "待审批",
    action: "审批",
    routeName: "approvals",
    items: approvals,
  },
  {
    key: "rectify",
    title: "待整改",
    action: "整改",
    routeName: "tasks",
    items: hazards.filter((item) => getTaskStatus(item) === "plan" || getTaskStatus(item) === "rectifying"),
  },
  {
    key: "acceptance",
    title: "待验收",
    action: "验收",
    routeName: "acceptances",
    items: acceptances,
  },
];
