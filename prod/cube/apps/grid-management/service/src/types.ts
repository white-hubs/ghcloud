/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}
export interface GridManager {
  gridManagerId: string;
  gridManagerName: string;
  avatar: {
    path: string;
  } | null;
  workStatus: string;
  mobile: string;
}

export interface GridMember {
  name: string;
  mobile: string;
}

export interface GridDTO {
  gridAreaId: string;
  gridName: string;
  gridDepartmentId: string;
  gridDepartmentName: string;
  handoverRecordId?: string;
  handoverStatus?: string;
  childAreaName: string;
  gridManagers: GridManager[];
  gridMembers: GridMember[];
  gridMemberNames: string[];
}

export interface GridStatisticsTotalDTO {
  gridCount: number;
  gridLeaderCount: number;
  gridMemberCount: number;
  deviceCount: number;
  assetCount: number;
}

export interface GridStatisticsChildrenDTO {
  gridAreaId: string | number;
  gridAreaName: string;
  gridLeaderName: string;
  gridMemberCount: number;
  deviceCount: number;
  assetCount: number;
  processingTaskCount: number;
  finishedTaskCount: number;
  abnormalTaskCount: number;
  unfinishedOrderCount: number;
  alarmCount: number;
}

export interface FaultApplyDTO {
  id?: string | number;
  formNo?: Record<string, unknown>;
  formInstanceId?: string | number;
  processInstanceId?: string;
  startUserId?: string | number;
  businessType?: string;
  businessTypeName?: string;
  status?: string;
  statusName?: string;
  startUserInfo?: {
    organizationName?: string;
    startUserName?: string;
  };
  submitedTime?: number | string;
  submitTime?: number | string;
  createTime?: number | string;
  updateTime?: number | string;
  lastTaskCompletedTime?: number | string;
  startUserName?: string;
  activeNodeName?: string;
  currentTaskId?: string;
  instanceName?: string;
  name?: string;
  objName?: string;
  hiddenObjName?: string;
  code?: string;
  faultType?: string;
  source?: string;
  urgencyLevel?: string;
  result?: string;
  activeNodeAssignee?: string;
  currentTaskUrl?: string;
  url?: string;
}

export interface FaultApplyHomePageStatisticsDTO {
  orderCount: number;
  orderRatio: number;
  processOrder: number;
  finishOrder: number;
}
export interface GridConfigDTO {
  gridAreaId: string;
  gridDepartmentId: string;
  gridManagerIds: string[];
  gridMembers: {
    relationType: string;
    relationIds: string[];
  }[];
}
export interface Organization {
  id: string;
  name: string;
}

export interface Position {
  id: string;
  name: string;
}

export interface Appointment {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface GridUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  gender: string;
  workStatus: string;
  remark: string;
  username: string;
  password: string;
  enabled: boolean;
  entryDate?: unknown;
  createTime?: unknown;
  lastLoginTime?: unknown;
  photographKey?: unknown;
  organization: Organization;
  organizations: Organization[];
  positions: Position[];
  appointments: Appointment[];
  roles: Role[];
  photographList: unknown[];
  tenants: unknown[];
  admin?: unknown;
}

export interface MyGridDTO {
  user: GridUser;
  gridAreas: { areaId: string; areaName: string }[];
}
export interface GridTaskDTO {
  id: string;
  taskName: string;
  taskTime: string;
  applicationCode: string;
  applicationName: string;
  businessKey: string;
  businessType: string;
  businessTypeName: string;
  businessStatus: string;
  businessStatusName: string;
  status: string;
  handlerTime: string;
  url: string;
  taskDelState: boolean;
  businessPrincipal: string;
}
export interface GridTaskStatDTO {
  totalNum: number;
  doneTotalNum: number;
  normalNum: number;
  doneNormalNum: number;
  alarmNum: number;
  doneAlarmNum: number;
  approveNum: number;
  doneApproveNum: number;
  faultOrderNum: number;
}
export interface AreaObjectCount {
  deviceCount: number;
  gridAreaId: string;
  patrolLocationCount: number;
  propertyCount: number;
  scenePointCount: number;
  stallCount: number;
}
export interface handoverRecordDTO {
  id: string;
  recordName: string;
  taskNum: number;
  gridAreaName?: string;
  shiftOverUserName: string;
  shiftOverTime: number;
  takeOverUserName: string;
  takeOverTime?: number;
  status: string;
  revoke: boolean;
}

export type GridHandoverStatus = "WAIT_HANDOVER" | "HAND_TAKE" | "HAND_OVERED" | "TAKE_OVERED" | "CANCEL";

export interface GridHandoverListParams {
  pageSize: number;
  pageNumber: number;
  status?: GridHandoverStatus;
  permission?: boolean;
  shiftOverUser?: string;
  takeOverUser?: string;
}

export interface GridHandoverDetailDTO {
  id: string;
  gridAreaId: string;
  gridAreaName: string;
  shiftOverUserId: string;
  shiftOverUserName: string;
  shiftOverTime?: string;
  takeOverUserId?: string;
  takeOverUserName?: string;
  takeOverTime?: string;
  status: string;
  remarks?: string;
  beforeManagerIds?: string;
  afterManagerIds?: string;
  extend?: {
    attInfo1?: string;
    file1?: GridHandoverFileVO[];
    attInfo2?: string;
    file2?: GridHandoverFileVO[];
    attInfo3?: string;
    file3?: GridHandoverFileVO[];
    attInfo4?: string;
    file4?: GridHandoverFileVO[];
  };
}

export interface GridHandoverFileVO {
  id?: string;
  name?: string;
  path?: string;
  type?: string;
}

export interface ModelConfig {
  three: {
    modelServer: {
      name: string;
      url: string;
      area: string[];
      areaList: {
        id: string;
        name: string;
        aliasName: string;
      }[];
    }[];
  };
}

export interface GridList {
  id: string;
  parentId: string;
  level: number;
  name: string;
  children?: GridList[];
}

/** 公示栏 - 网格负责人卡片 */
export interface BulletinGridManager {
  gridManagers: GridManager[];
  engineeringManager: GridManager;
  safetyManager: GridManager;
  cleaningManager: GridManager;
  meteringManager: GridManager;
  meteringStaff: GridManager;
  gridMemberInfo: GridManager[];
}

/** 公示栏 - 通知公告 */
export interface BulletinAnnouncement {
  id: string;
  title: string;
  content: string;
  levelName: string;
  level: string;
  createTime: string;
  createBy: string;
  tagName: string;
  typeName: string;
  publishAgency?: string;
}
