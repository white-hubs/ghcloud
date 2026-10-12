import dayjs from "dayjs";
import { reactive } from "vue";

export const DEVICE_PROPERTY_CODES = {
  ventilationDuration: "fumigation_ventilation_duration_min",
  ph3Indoor: "fumigation_ph3_indoor_ppm",
  ph3Outdoor: "fumigation_ph3_outdoor_ppm",
  ph3Entrance: "fumigation_ph3_entrance_ppm",
  o2Indoor: "fumigation_o2_indoor_percent",
  aiPeople: "fumigation_ai_people_count",
  aiMask: "fumigation_ai_mask_status",
  aiProtection: "fumigation_ai_protection_status",
} as const;

export type DevicePropertyCode = (typeof DEVICE_PROPERTY_CODES)[keyof typeof DEVICE_PROPERTY_CODES];
export type WorkStatus =
  | "SAFETY_APPROVING"
  | "TECH_APPROVING"
  | "PENDING_CHECK"
  | "CHECK_FAILED"
  | "PENDING_START"
  | "EXECUTING"
  | "ARCHIVED"
  | "REJECTED";
export type ApprovalNode = "safety" | "technical";
export type ApprovalAction = "approved" | "rejected";
export type PrecheckStepId = "VENTILATION_DURATION" | "PH3_CONCENTRATION" | "OXYGEN_CONCENTRATION";
export type CheckStatus = "pending" | "passed" | "failed";

export interface GrainVarietyOption {
  id: string;
  name: string;
  warehouseId: string;
  source: "intelligent-grain-service";
}

export interface WarehouseOption {
  id: string;
  code: string;
  name: string;
  grainVarieties: GrainVarietyOption[];
  capacityTon: number;
  source: "intelligent-grain-service";
}

export interface Certificate {
  id: string;
  name: string;
  no: string;
  expireAt: string;
  expired?: boolean;
}

export interface WorkerOption {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  certificates: Certificate[];
  source?: "security-personnel-service";
}

export interface FumigationWorkPerson {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  department?: string;
  postName?: string;
  role?: string;
  certId?: string;
  certName?: string;
  certNo?: string;
  certExpireAt?: string;
  certExpired?: boolean;
}

export interface DeviceProperty {
  code: DevicePropertyCode;
  name: string;
  value: number;
  unit: string;
  updatedAt?: string;
}

export interface CameraOption {
  id: string;
  thirdPartyId?: string;
  name: string;
  channelNo: string;
}

export interface LinkedDevice {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline" | string;
}

export interface AlarmFlowEvent {
  id: string;
  time: string;
  title: string;
  handler: string;
  result: string;
}

export interface TrendPoint {
  time: string;
  value: number;
}

export interface DeviceOption {
  id: string;
  code: string;
  name: string;
  warehouseId: string;
  locationName?: string;
  properties?: DeviceProperty[];
  cameras?: CameraOption[];
  linkedDevices?: LinkedDevice[];
  alarmFlow?: AlarmFlowEvent[];
  indoorPh3Trend?: TrendPoint[];
}

export interface ApprovalRecord {
  id: string;
  node: ApprovalNode;
  nodeName: string;
  action: ApprovalAction;
  operatorName: string;
  opinion: string;
  at: string;
}

export interface CheckFieldValue {
  label: string;
  value: string;
}

export interface CheckPropertyValue {
  code: string;
  name: string;
  value: string | number | boolean | null;
  unit?: string;
  ts?: string | number;
  pass?: boolean;
  message?: string;
}

export interface PrecheckResult {
  stepId: PrecheckStepId;
  title: string;
  status: CheckStatus;
  message: string;
  checkedAt: string;
  values: CheckFieldValue[];
  propertyValues: CheckPropertyValue[];
  deviceId?: string;
  rule?: string;
}

export interface FumigationAttachment {
  id: string;
  name: string;
  path?: string;
  suffix?: string;
  size?: number;
  sceneCode?: string;
  fileVO?: {
    id: string | number;
    name: string;
    path?: string;
    suffix?: string;
    size?: number;
    type?: string;
    businessKey?: string | number | null;
  };
}

export interface FumigationWork {
  id: string;
  code: string;
  title: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  grainVarietyId: string;
  grainVarietyName: string;
  deviceId: string;
  deviceCode?: string;
  deviceName?: string;
  expectedDurationHours: number;
  createdAt: string;
  plannedStartAt: string;
  plannedDosage: string;
  grainQuantity?: number;
  pesticideTypeCode?: string;
  pesticideTypeName?: string;
  pesticideType?: string;
  pesticideDosage?: string;
  applicationMethodCode?: string;
  applicationMethodName?: string;
  applicationMethod?: string;
  sealedDays?: number;
  expectedVentilationAt?: string;
  applicantName: string;
  safetyLead: string;
  technicalLead: string;
  siteLeader: string;
  safetyDisclosure: string;
  emergencyPlan: string;
  safetyMeasures?: string;
  workerIds: string[];
  workers: FumigationWorkPerson[];
  actualWorkerCount: number;
  status: WorkStatus;
  currentApprovalNode: ApprovalNode | null;
  approvalRecords: ApprovalRecord[];
  prechecks: Record<PrecheckStepId, PrecheckResult>;
  completionDescription?: string;
  terminationReason?: string;
  archivedAt?: string;
  availableActions?: string[];
  attachments?: FumigationAttachment[];
}

export interface ArchiveRecord {
  id: string;
  workId: string;
  archiveNo?: string;
  generatedAt: string;
  generatedBy: string;
}

interface FumigationState {
  works: FumigationWork[];
  archives: ArchiveRecord[];
}

export const isWorkApprovalPending = (status: WorkStatus | undefined): boolean =>
  status === "SAFETY_APPROVING" || status === "TECH_APPROVING";

export const canApproveFumigationWork = (work: Pick<FumigationWork, "status" | "availableActions"> | undefined): boolean => {
  if (work == null) {
    return false;
  }
  if (work.availableActions?.includes("APPROVE")) {
    return true;
  }
  return isWorkApprovalPending(work.status);
};

export const WORK_STATUS_META: Record<WorkStatus, { label: string; type: "primary" | "success" | "danger" | "warning" | "default" }> = {
  SAFETY_APPROVING: { label: "待审批", type: "warning" },
  TECH_APPROVING: { label: "待技术审批", type: "primary" },
  PENDING_CHECK: { label: "待校验", type: "warning" },
  CHECK_FAILED: { label: "校验未通过", type: "danger" },
  PENDING_START: { label: "监护中", type: "success" },
  EXECUTING: { label: "监护中", type: "success" },
  ARCHIVED: { label: "已归档", type: "default" },
  REJECTED: { label: "已驳回", type: "default" },
};

export const APPROVAL_NODE_META: Record<ApprovalNode, { label: string; previous: ApprovalNode | null }> = {
  safety: { label: "安全审批", previous: null },
  technical: { label: "技术审批", previous: "safety" },
};

export const PRECHECK_STEP_META: Record<PrecheckStepId, { title: string; description: string }> = {
  VENTILATION_DURATION: { title: "通风时长检测", description: "读取通风时长设备属性" },
  PH3_CONCENTRATION: { title: "磷化氢浓度检测", description: "读取仓内、仓外等 PH3 设备属性" },
  OXYGEN_CONCENTRATION: { title: "氧气浓度检测", description: "读取氧气浓度设备属性" },
};

export const fumigationState = reactive<FumigationState>({
  works: [],
  archives: [],
});

export const replaceFumigationWorks = (works: FumigationWork[]): void => {
  fumigationState.works.splice(0, fumigationState.works.length, ...works);
};

export const upsertFumigationWork = (work: FumigationWork): void => {
  const index = fumigationState.works.findIndex((item) => item.id === work.id);
  if (index < 0) {
    fumigationState.works.unshift(work);
    return;
  }
  fumigationState.works.splice(index, 1, work);
};

export const replaceFumigationArchives = (archives: ArchiveRecord[]): void => {
  fumigationState.archives.splice(0, fumigationState.archives.length, ...archives);
};

export const upsertFumigationArchive = (archive: ArchiveRecord): void => {
  const index = fumigationState.archives.findIndex((item) => item.id === archive.id);
  if (index === -1) {
    fumigationState.archives.unshift(archive);
    return;
  }
  fumigationState.archives.splice(index, 1, archive);
};

export const allPrechecksPassed = (work: FumigationWork): boolean =>
  work.prechecks != null && Object.values(work.prechecks).every((item) => item.status === "passed");

export const allApprovalNodesPassed = (work: FumigationWork): boolean =>
  work.approvalRecords.some((item) => item.node === "safety" && item.action === "approved") &&
  work.approvalRecords.some((item) => item.node === "technical" && item.action === "approved");

export const getApprovalProgress = (work: FumigationWork): string => {
  const approvedCount = work.approvalRecords.filter((item) => item.action === "approved").length;
  return `${Math.min(approvedCount, 2)}/2`;
};

export const getPesticideDisplayName = (work: FumigationWork): string =>
  work.pesticideTypeName ?? work.pesticideType ?? work.plannedDosage?.split(" ")[0] ?? "--";

export const getWarehouseDisplayName = (work: FumigationWork): string => work.warehouseName?.trim() || work.warehouseCode?.trim() || "--";

export const canRunPrecheck = (work: FumigationWork): boolean => {
  if (!allApprovalNodesPassed(work)) {
    return false;
  }
  if (work.status === "PENDING_START" || work.status === "EXECUTING" || allPrechecksPassed(work)) {
    return false;
  }
  return work.status === "PENDING_CHECK" || work.status === "CHECK_FAILED";
};

export const canEnterMonitorBoard = (work: Pick<FumigationWork, "status" | "availableActions"> | undefined): boolean => {
  if (work == null) {
    return false;
  }
  if (work.availableActions?.includes("COMPLETE") || work.availableActions?.includes("CLOSE")) {
    return true;
  }
  return work.status === "PENDING_START" || work.status === "EXECUTING";
};

export const canCompleteFumigationWork = (work: Pick<FumigationWork, "status" | "availableActions"> | undefined): boolean => {
  if (work == null) {
    return false;
  }
  if (work.availableActions?.includes("COMPLETE")) {
    return true;
  }
  return work.status === "PENDING_START" || work.status === "EXECUTING";
};

export const parseDateTimeValue = (value: unknown): dayjs.Dayjs | null => {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return dayjs(value < 1e12 ? value * 1000 : value);
  }
  const raw = String(value).trim();
  if (raw === "") {
    return null;
  }
  if (/^\d+$/.test(raw)) {
    const numeric = Number(raw);
    if (!Number.isFinite(numeric)) {
      return null;
    }
    return dayjs(numeric < 1e12 ? numeric * 1000 : numeric);
  }
  const parsed = dayjs(raw);
  return parsed.isValid() ? parsed : null;
};

export const formatDateTimeValue = (value: unknown, fallback = "--", pattern = "YYYY-MM-DD HH:mm"): string => {
  const parsed = parseDateTimeValue(value);
  return parsed == null ? fallback : parsed.format(pattern);
};

export const getDueAt = (work: FumigationWork): string => {
  const createdAt = parseDateTimeValue(work.createdAt);
  if (createdAt == null) {
    return "--";
  }
  return createdAt.add(work.expectedDurationHours, "hour").format("YYYY-MM-DD HH:mm:ss");
};

export const getSelectedWorkers = (work: FumigationWork): WorkerOption[] =>
  (work.workers ?? []).map((person) => ({
    id: person.userId || person.id,
    name: person.name,
    role: person.role ?? person.postName ?? "作业人员",
    department: person.department ?? "",
    phone: person.phone ?? "",
    source: "security-personnel-service",
    certificates:
      person.certName != null
        ? [
            {
              id: person.certId ?? person.userId,
              name: person.certName,
              no: person.certNo ?? "",
              expireAt: person.certExpireAt ?? "",
            },
          ]
        : [],
  }));

export const getWorkerCertificate = (worker: WorkerOption): Certificate | undefined => worker.certificates[0];

export const isCertificateExpired = (certificate: Certificate | undefined): boolean => {
  if (certificate == null || certificate.expireAt.trim() === "") {
    return true;
  }
  const expireAt = new Date(certificate.expireAt.replace(" ", "T"));
  if (Number.isNaN(expireAt.getTime())) {
    return true;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expireAt.getTime() < today.getTime();
};

export const getProperty = (device: DeviceOption | undefined, code: DevicePropertyCode): DeviceProperty | undefined =>
  device?.properties?.find((item) => item.code === code);
