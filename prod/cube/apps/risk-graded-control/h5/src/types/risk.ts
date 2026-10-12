export type RiskLevel = "MAJOR" | "SIGNIFICANT" | "GENERAL" | "LOW";

export type ObjectStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "INHERENT_EVAL"
  | "INNATE_EVAL"
  | "CONTROL_EVAL"
  | "CONTROL_SET"
  | "EXECUTING"
  | "ACTIVE"
  | "RE_EVAL";

export type IdentificationStatus = "PENDING" | "IDENTIFYING" | "PENDING_REVIEW" | "REVIEWED";

export interface GeoPoint {
  lng: number;
  lat: number;
  address?: string;
}

export interface PolygonGeo {
  points: GeoPoint[];
  description?: string;
  shape?: "polygon" | "circle";
  radius?: number;
}

export interface WarningSignVO {
  id: string;
  code: string;
  name: string;
  type: string;
  iconFileId?: string;
  iconUrl?: string;
  status: "ENABLED" | "DISABLED";
}

export interface RiskControlFileVO {
  id?: string | number;
  name?: string;
  path?: string;
  endpointPath?: string;
  suffix?: string;
  size?: number;
  type?: string;
}

export interface UnitTypeVO {
  id: string;
  code: string;
  name: string;
}

export interface ZoneVO {
  id: string;
  code: string;
  name: string;
  department: string;
  departmentId: string;
  scopeText: string;
  manager?: string;
  managerId?: string;
  riskLevel?: RiskLevel;
  unitCount: number;
  remark?: string;
  polygon?: PolygonGeo;
}

export interface UnitVO {
  id: string;
  code: string;
  name: string;
  unitTypeId: string;
  unitType: string;
  zoneId: string;
  zoneName: string;
  locationDesc?: string;
  location?: GeoPoint;
  warningSignId?: string;
  warningSignName?: string;
  identifyCycleDays: number;
  identifyUserIds: string[];
  identifyUsers: string[];
  responsibleUserId: string;
  responsibleUser: string;
  identifyStatus?: IdentificationStatus;
  currentIdentifyRoundNo?: string;
  lastIdentifySubmitTime?: string;
  lastIdentifyReviewTime?: string;
  nextIdentifyTime?: string;
  objectCount?: number;
  rejectedCount?: number;
  riskLevel?: RiskLevel;
  inherentRiskLevel?: RiskLevel;
  controlRiskLevel?: RiskLevel;
  description?: string;
}

export interface AssessmentDimensionOption {
  label: string;
  value: number;
}

export interface RiskObjectVO {
  id: string;
  unitId: string;
  name: string;
  assetId?: string;
  assetName?: string;
  hazardDesc: string;
  accidentTypes: string[];
  cause: string;
  triggerFactors?: string;
  emergencyMeasures: string;
  responsibleUserId: string;
  responsibleUser: string;
  status: ObjectStatus;
  innateLevel?: RiskLevel;
  controlLevel?: RiskLevel;
}

export interface AssessmentDimension {
  code: string;
  name: string;
  options: AssessmentDimensionOption[];
}

export interface AssessmentLevelRule {
  level: RiskLevel;
  color: string;
  range: string;
  requirement: string;
}

export interface AssessmentMethodVO {
  id: string;
  code: string;
  name: string;
  formula: string;
  status: "ENABLED" | "DISABLED";
  dimensions: AssessmentDimension[];
  levelRules: AssessmentLevelRule[];
  description?: string;
}

export interface RiskObjectVO {
  id: string;
  unitId: string;
  name: string;
  assetId?: string;
  assetName?: string;
  hazardDesc: string;
  accidentTypes: string[];
  cause: string;
  triggerFactors?: string;
  emergencyMeasures: string;
  responsibleUserId: string;
  responsibleUser: string;
  status: ObjectStatus;
  innateLevel?: RiskLevel;
  controlLevel?: RiskLevel;
}

export interface ControlMeasureVO {
  id: string;
  unitId: string;
  objectId: string;
  controlType: string;
  content: string;
  controlLevel: string;
  executorId: string;
  executor: string;
  deadline?: string;
  execStatus: "PENDING" | "EXECUTING" | "DONE" | "OVERDUE";
  files?: RiskControlFileVO[];
}

export interface IdentificationUnitVO {
  id: string;
  code: string;
  unitName: string;
  unitType: string;
  zoneName: string;
  identifyUsers: string[];
  status: IdentificationStatus;
  objectCount: number;
  rejectedCount: number;
  submitTime?: string;
}

export interface ReviewItemVO {
  id: string;
  objectId: string;
  identifyRoundNo?: string;
  objectName: string;
  unitName: string;
  identifyUser: string;
  hazardDesc: string;
  accidentTypes: string[];
  submitTime: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewResult?: "APPROVED" | "REJECTED";
  rejectReason?: string;
  reviewComment?: string;
  reviewerUserId?: string;
  reviewerUser?: string;
  reviewTime?: string;
  cause?: string;
  triggerFactors?: string;
  emergencyMeasures?: string;
  responsibleUser?: string;
}

export interface IdentificationHistoryRecordVO {
  id: string;
  objectId: string;
  objectName: string;
  unitName: string;
  identifyRoundNo: string;
  operationType: "CREATE" | "UPDATE" | "DELETE" | string;
  operationLabel: string;
  submitTime: string;
  identifyUser: string;
  hazardDesc: string;
  accidentTypes: string[];
  cause: string;
  triggerFactors?: string;
  emergencyMeasures: string;
  responsibleUserId?: string;
  deleted?: boolean;
  reviewStatus?: "PENDING" | "APPROVED" | "REJECTED";
  reviewResult?: "APPROVED" | "REJECTED";
  rejectReason?: string;
  reviewComment?: string;
  reviewerUser?: string;
  reviewTime?: string;
}

export interface AssessmentUnitVO {
  id: string;
  unitName: string;
  zoneName: string;
  riskLevel?: RiskLevel;
  objectCount: number;
  progress: string;
}

export interface EvaluationPlanVO {
  id: string;
  name: string;
  unitName: string;
  cycle: string;
  nextExecuteTime: string;
  status: "ENABLED" | "DISABLED";
  notifyCount: number;
}

export interface WarningRuleVO {
  id: string;
  type: string;
  title: string;
  status: "ENABLED" | "DISABLED";
  condition: string;
  notifyTargets: string[];
  notifyChannels: string[];
  deadlineDays: number;
}

export interface WarningEventVO {
  id: string;
  title: string;
  severity: "RED" | "ORANGE" | "YELLOW";
  warningType?: string;
  unitId?: string;
  objectId?: string;
  objectCode?: string;
  objectName?: string;
  unitName: string;
  triggerTime: string;
  status: "ACTIVE" | "DISPOSED";
  description: string;
  disposeTime?: string;
  disposeDesc?: string;
  disposeResult?: string;
}

export interface NotificationCardVO {
  id: string;
  unitName: string;
  riskLevel: RiskLevel;
  department: string;
  responsibleUser: string;
  phone?: string;
  hazardSummary: string;
  accidentTypes: string[];
  warningSigns: string[];
  measures: string[];
  emergencyText: string;
}

export interface OrgUserVO {
  id: string;
  name: string;
  department: string;
}

export interface HiddenDangerRecordVO {
  code: string;
  description: string;
  foundTime: string;
  riskLevel: RiskLevel;
  status: string;
  closedTime?: string;
}

export interface UnitInventoryRowVO {
  unit: UnitVO;
  objects: RiskObjectVO[];
  measures: ControlMeasureVO[];
  hiddenDangers: HiddenDangerRecordVO[];
  objectCount?: number;
  measureCount?: number;
  detailLoaded?: boolean;
}
