export type TimeFilterType = "today" | "7d" | "30d" | "custom";

export interface TimeFilter {
  type: TimeFilterType;
  period?: [string, string];
}

export type TaskStatus = "待接收" | "待巡检" | "已巡检" | "已终止" | "已超时";
export type TaskInspectionMode = "MANUAL" | "DRONE" | "HYBRID" | "ROBOT_DOG" | "HYBRID_ROBOT_DOG";

export interface TaskItem {
  id: string;
  name: string;
  patrolType: string;
  patrolLevel: string;
  inspectionMode: TaskInspectionMode;
  inspectionModeName: string;
  deviceName?: string;
  routeName?: string;
  objectCount: number;
  status: TaskStatus;
  rawStatus: string;
  owner: string;
  ownerId: string;
  beginTime?: string;
  endTime?: string;
  description?: string;
  transferredTo?: string;
  canTransfer: boolean;
  canTerminate: boolean;
}

export interface TransferUser {
  id: string;
  name: string;
  detail: string;
}

export interface TaskObjectItem {
  id: string;
  taskId: string;
  planId: string;
  targetId: string;
  targetName: string;
  targetCode: string;
  targetCategory: string;
  targetCategoryName: string;
  targetType: string;
  targetTypeName: string;
  targetParentId: string;
  targetAddress: string;
  targetAreaId: string;
  targetAreaName: string;
  latAndLon: string;
  location: string;
  isRelated: boolean;
}

export type LayerType = "INSPECTION_POINTS" | "COVERAGE" | "HEATMAP" | "PERSONNEL_PLACEHOLDER" | "VEHICLE_PLACEHOLDER";

export interface PersonnelDepartment {
  id: string;
  name: string;
  children?: PersonnelDepartment[];
}

export interface PersonnelLocation {
  lng: number;
  lat: number;
}

export interface PersonnelFile {
  path?: string;
}

export interface PersonnelItem {
  id: string;
  name: string;
  mobile: string;
  account: string;
  file: PersonnelFile | null;
  gps: PersonnelLocation | null;
  organizationName: string;
  positionName: string;
  isOnline: boolean;
}

export interface PersonnelTrackPoint {
  id: string;
  lng: number;
  lat: number;
  address: string;
  uploadTime: number | string;
  timeText: string;
}

export interface PersonnelTrackPageData {
  records: PersonnelTrackPoint[];
  total: number;
  pages: number;
}

export interface DepartmentMember {
  name: string;
  done: number;
  total: number;
}

export interface DepartmentStat {
  id: string;
  name: string;
  done: number;
  total: number;
  members: DepartmentMember[];
}

export type InspectionTargetCategory = "STALL" | "DEVICE" | "PROPERTY" | "SITE_POINT" | "RISK_SOURCE" | "SMALL_ENGINEERING";

export interface InspectionPointItem {
  id: string;
  name: string;
  code: string;
  type: string;
  typeName: string;
  category: InspectionTargetCategory;
  categoryName: string;
  latAndLon: string;
  location: string;
}
