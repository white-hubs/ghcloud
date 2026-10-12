/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}

export interface FileVO {
  id: string;
  name: string;
  suffix: string;
  path: string;
  size: number;
  createTime: string;
  refCount: number;
  type: string;
  businessKey: string | null;
}

export interface DataTypeVO {
  id: string;
  dataName: string;
  remark: string;
  count: number;
}

export interface ProjectVO {
  id: string;
  projectCode: string;
  projectName: string;
  projectTypeId: string;
  projectTypeName: string;
  company: string;
  beginTime: string;
  endTime: string;
  leaderId: string;
  leaderUserName: string;
  disinfectionArea: number;
  disinfectionLocationName: string;
  disinfectionLocation: string;
  disinfectionScope: string;
  description: string;
  status: string;
}

export interface ProjectAreaCountVO {
  projectId: string;
  projectName: string;
  count: string;
}

export interface ProjectAreaVO {
  id?: string;
  areaName: string;
  areaDetail: string;
  projectId: string;
  projectName: string;
  key: string;
}

export interface ProjectFileVO {
  id: string;
  projectId: string;
  fileName: string;
  fileTypeId: string;
  fileTypeName: string;
  fileId: string;
  materialName: string;
  uploadUserId: string;
  uploadUserName: string;
  uploadTime: string;
  fileVO: FileVO;
}

export interface ProjectPlaceVO {
  id: string;
  placeName: string;
  projectId: string;
  projectName: string;
  placeTypeId: string;
  placeTypeName: string;
  placeDetail: string;
  longitude: string;
  latitude: string;
  placeDescription: string;
  files: FileVO[];
  address?: string;
  province: string;
  city: string;
  region: string;
}

export interface ProjectGroupVO {
  id: string | null;
  projectId: string;
  projectName: string;
  groupName: string;
  count: string;
  userIds: string;
  users?: UserVO[];
  groupUsers?: UserVO[];
}
export interface UserVO {
  id: string;
  name: string;
  mobile: string;
  organization: Dept;
  positions: Dept[];
  roles: Dept[];
}
export interface Dept {
  id: string;
  name: string;
}

export interface PlanVO {
  id: string;
  projectId: string;
  projectName: string;
  beginTime: string;
  endTime: string;
  taskGenerationCycleConfig: string;
  projectLeaderId: string;
  taskTimeLimitConfig: string;
  remark: string;
  status: string;
  enable: string;
  planTaskConfigList: {
    id: string;
    projectId: string;
    planId: string;
    taskTypeId: string;
    taskName: string;
    taskAreaId: string;
    disinfectionFrequency: string;
    notificationType: string;
    notificationGroupId: string;
  }[];
}

export interface DeviceVO {
  id: string;
  name: string;
  code: string;
  status: {
    onlineState: boolean;
    communicationTime: string;
  };
  department: {
    id: string;
    name: string;
  };
  thirdPartyId: string;
  lntAndLat: string;
  area: {
    id: string;
    name: string;
    pathName: string;
    pathId: string;
  };
  picture: string;
  productInfo: {
    id: string;
    name: string;
    picture: string;
    icon: string;
    modelName: string;
    brandName: string;
    productCategory: {
      name: string;
      code: string;
      pathCode: string;
    };
  };
  inventory: string;
  dosage: string;
  propList?: PropResult[];
}

export interface GroupVO {
  id: string;
  memberUserId: string;
  memberUserName: string;
  groupName: string;
  userCount: number;
  createTime: string;
  memberUserBool?: boolean;
}

export interface CommandVO {
  id: string;
  name: string;
  display: string;
  deviceId: string;
  propCode: string;
  propValue: string;
  loopType: string;
  loopDay: string;
  loopHour: string;
  cron: string;
  taskId: string;
  propWriteValueList: {
    code: string;
    expectedValue: string;
    name: string;
  }[];
}

export interface MemberUserDTO {
  /**
   * 创建时间
   */
  createTime?: string;
  /**
   * 所属分组
   */
  groups?: string;
  /**
   * 主键
   */
  id?: number | string;
  /**
   * 最后登录时间
   */
  lastLoginTime?: string;
  /**
   * 联系电话
   */
  mobile?: string;
  /**
   * 用户姓名
   */
  name?: string;
  /**
   * 注册地址
   */
  registerAddress?: string;
}

export interface MemberGroupDTO {
  /**
   * 创建时间
   */
  createTime?: string;
  /**
   * 分组名
   */
  groupName?: string;
  /**
   * 主键
   */
  id?: number;
  /**
   * 管理员id
   */
  memberUserId?: number;
  /**
   * 管理者名
   */
  memberUserName?: string;
  /**
   * 用户数
   */
  userCount?: number;
}

export interface MemberGroupDTO {
  /**
   * 创建时间
   */
  createTime?: string;
  /**
   * 分组名
   */
  groupName?: string;
  /**
   * 主键
   */
  id?: number;
  /**
   * 管理员id
   */
  memberUserId?: number;
  /**
   * 管理者名
   */
  memberUserName?: string;
  /**
   * 用户数
   */
  userCount?: number;
}
export interface MemberLogResult {
  createTime?: string;
  detail?: string;
  id?: number;
  title?: string;
  type?: LogType;
}
export interface Division {
  center?: string;
  detail?: string;
  cityCode?: string;
  code?: string;
  id: number;
  level: number;
  pid: number;
  name?: LogType;
  childrenList?: Division[];
}
export enum LogType {
  DeviceAlarmLog = "DEVICE_ALARM_LOG",
  DeviceWorkLog = "DEVICE_WORK_LOG",
  UserOperationLog = "USER_OPERATION_LOG",
}

export interface PropResult {
  dataConstraint?: string;
  dataConstraintStr?: string;
  dataType?: string;
  dataWrite?: number;
  isTelemetry?: boolean;
  precision?: number;
  propCode?: string;
  propName?: string;
  remark?: string;
  unitName?: string;
  value?: string;
}
/**
 * 指令枚举：驱蚊指令、雾灌指令、设备关闭、定时任务
 */
export enum Command {
  DEVICE_OFF = "DEVICE_OFF",
  DRIVE_MOSQUITO = "DRIVE_MOSQUITO",
  MIST_SPRAY = "MIST_SPRAY",
  SCHEDULED_TASK = "SCHEDULED_TASK",
}
/**
 * 定时任务模式：每天、每周
 */
export enum ScheduleMode {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
}
export interface ScheduledTaskPlanItemParam {
  /**
   * 指令枚举
   */
  command: Command;
  /**
   * 每周的第几天（1=周一 ~ 7=周日），定时任务模式为每周时使用
   */
  dayOfWeek?: number;
  /**
   * 执行结束时间
   */
  endTime: string;
  /**
   * 执行开始时间
   */
  startTime: string;
}

/**
 * 定时任务分页行
 *
 */
export interface ScheduledTaskPageResult {
  id?: number;
  name?: string;
  scheduleMode?: ScheduleMode;
  deviceNames?: string[];
}

/**
 * 定时任务详情
 *
 */
export interface ScheduledTaskDetailResult {
  deviceIds?: number[];
  groupId?:      number;
  productId?: string | number;
  id?: number;
  name?: string;
  planList?: ScheduledTaskPlanItemResult[];
  scheduleMode?: ScheduleMode;
  deviceList?: DeviceBaseDetailsDTO[];
}

export interface DeviceBaseDetailsDTO {
  /**
   * 区域ID,-分割
   */
  areaId?: string;
  /**
   * 最末级的区域ID
   */
  areaLastId?: number;
  /**
   * 区域ID名称,--分割
   */
  areaName?: string;
  /**
   * 最后通信时间
   */
  communicationTime?: string;
  createBy?:          string;
  createTime?:        string;
  /**
   * 归属部门
   */
  departmentId?: number;
  /**
   * 归属部门名称
   */
  departmentName?: string;
  /**
   * 设备编码(孪生编码)
   */
  deviceCode?: string;
  /**
   * 设备产品ID
   */
  deviceIotProdId?: number;
  /**
   * 设备名称
   */
  deviceName?: string;
  /**
   * 0 离线 1在线
   */
  deviceState?: boolean;
  /**
   * 0 离线 1在线
   */
  deviceStateCode?: number;
  /**
   * 物联网设备ID
   */
  id?: number;
  /**
   * 经纬度
   */
  lntAndLat?: string;
  /**
   * 位置描述信息
   */
  locationDes?: string;
  /**
   * 管理人员ids,-分割
   */
  managerIds?: string;
  /**
   * 管理人员名称,--分割
   */
  managerNames?: string;
  /**
   * 产品品类编号
   */
  productCategoryCode?: string;
  /**
   * 产品品类名称
   */
  productCategoryName?: string;
  tenant?:              number;
  /**
   * 三方设备配置
   */
  thirdpartyCfg?: string;
  /**
   * 三方设备ID
   */
  thirdPartyId?: string;
  updateBy?:     string;
  updateTime?:   string;
}
/**
* 定时任务计划项（详情返回）
*
*/
export interface ScheduledTaskPlanItemResult {
  command?: Command;
  dayOfWeek?: number;
  endTime?: string;
  startTime?: string;
}