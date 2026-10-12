import type { FileVO } from './types'

/**
 * 消杀项目统计
 */
export interface BimProjectStatisticsVO {
  /**
     * 已完成数
     */
  completed?: number;
  /**
     * 进行中数
     */
  inProgress?: number;
  /**
     * 待开始数
     */
  toStart?: number;
  /**
     * 项目总数
     */
  total?: number;
}


/**
 * 项目周期情况
 */
export interface ProjectStatisticsCycleVO {
  /**
     * 1个月
     */
  oneMonth?: number;
  /**
     * 1-3个月
     */
  oneToThreeMonth?: number;
  /**
     * 6个月以上
     */
  sixMonth?: number;
  /**
     * 3-6个月
     */
  threeToSixMonth?: number;
  /**
     * 总数
     */
  total?: number;
}
export enum DataType {
  PROJECT = "PROJECT",
  TASK = "TASK",
  FILE = "FILE",
  PLACE = "PLACE",
}
export interface DataTypeVO {
  /**
    * 数量
    */
  count?: number;
  /**
    * 名称
    */
  dataName?: string;
  id?: string;
}
export interface KeyPlacePageVO {
  /**
    * 图片文件信息
    */
  files?: FileVO[];
  /**
    * 主键ID
    */
  id?: number;
  /**
    * 场所图片
    */
  imgs?: string;
  /**
    * 纬度
    */
  latitude?: number;
  /**
    * 经度
    */
  longitude?: number;
  /**
    * 场所说明
    */
  placeDescription?: string;
  /**
    * 重点场所详细位置
    */
  placeDetail?: string;
  /**
    * 场所名称
    */
  placeName?: string;
  /**
    * 场所分类ID
    */
  placeTypeId?: number;
  /**
    * 场所分类名称
    */
  placeTypeName?: string;
  /**
    * 项目ID
    */
  projectId?: number;
  projectName?: string;
  placeTypeIcon: FileVO | null;
}
export interface BimUserStatisticsVO {
  /**
    * 消杀人员
    */
  disinfectionUserList?: DisinfectionUserInfoVO[];
  /**
    * 用户总数
    */
  total?: number;
}

export interface DisinfectionUserInfoVO {
  /**
    * 所属部门
    */
  department?: string;
  /**
    * 消杀小组
    */
  groupName?: string;
  groupId?: string;
  disinfectionGroupId?: string;
  /**
    * 姓名
    */
  name?: string;
  phone?: string;
  /**
    * 照片
    */
  photo?: FileVO[];
  fileVO?: FileVO;
  /**
    * 岗位
    */
  position?: string;
  /**
    * 项目名称
    */
  projectName?: string;
  /**
    * 用户id
    */
  userId?: string;
  online?: boolean;
  role?: string;
}
export interface ProjectPageVO {
  /**
    * 项目开始时间
    */
  beginTime?: string;
  /**
    * 业主单位
    */
  company?: string;
  /**
    * 项目说明
    */
  description?: string;
  /**
    * 项目面积
    */
  disinfectionArea?: string;
  /**
    * 项目所在地经纬度
    */
  disinfectionLocation?: string;
  /**
    * 项目所在地名称
    */
  disinfectionLocationName?: string;
  /**
    * 项目消杀范围经纬度，多个
    */
  disinfectionScope?: string;
  /**
    * 项目结束时间
    */
  endTime?: string;
  /**
    * 主键ID
    */
  id?: number | string;
  /**
    * 项目负责人Id
    */
  leaderId?: number;
  /**
    * 项目负责人名称
    */
  leaderName?: string;
  /**
    * 项目编号
    */
  projectCode?: string;
  /**
    * 项目名称
    */
  projectName?: string;
  /**
    * 项目类型ID
    */
  projectTypeId?: number;
  /**
    * 项目类型名称
    */
  projectTypeName?: string;
  /**
    * 项目状态
    */
  status?: ProjectStatus;
  projectImage?: FileVO;
}

/**
* 项目状态
*/
export enum ProjectStatus {
  WAITING = "WAITING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED"
}

export interface ProjectStatisticsBaseVO {
  /**
    * 图标
    */
  icon?: FileVO;
  keyId?: number | string;
  /**
    * 名称
    */
  keyName?: string;
  /**
    * 数量
    */
  number?: number;
  /**
    * 占比
    */
  percentage?: number;
}

export interface TaskPageVO {
  /**
     * 任务的截止时间
     */
  deadline?: string;
  /**
    * 执行者小组ID
    */
  executorGroupId?: number;
  /**
    * 执行人id
    */
  executorId?: number;
  /**
    * 执行人
    */
  executorName?: string;
  /**
    * 执行小组
    */
  groupName?: string;
  /**
    * Id
    */
  id?: number;
  /**
    * 项目负责人
    */
  leaderName?: string;
  /**
    * 通知的部门ID
    */
  notificationDeptId?: number;
  /**
    * 通知的部门名称
    */
  notificationDeptName?: string;
  /**
    * 通知的小组ID
    */
  notificationGroupId?: number;
  /**
    * 通知的小组名称
    */
  notificationGroupName?: string;
  /**
    * 通知的岗位ID
    */
  notificationPostId?: number;
  /**
    * 岗位名称
    */
  notificationPostName?: string;
  /**
    * 通知的角色ID
    */
  notificationRoleId?: number;
  /**
    * 角色名称
    */
  notificationRoleName?: string;
  /**
    * 通知类型
    */
  notificationType?: NotificationType;
  /**
    * 任务进度
    */
  process?: number;
  /**
    * 项目ID
    */
  projectId?: number;
  /**
    * 项目负责人ID
    */
  projectLeaderId?: number;
  /**
    * 项目名称
    */
  projectName?: string;
  /**
    * 任务状态
    */
  status?: TaskStatus;
  /**
    * 消杀区域ID
    */
  taskAreaId?: number;
  /**
    * 消杀区域ID
    */
  taskAreaName?: string;
  /**
    * 任务名称
    */
  taskName?: string;
  /**
    * 任务时限配置json（为空表示永不截至）
    */
  taskTimeLimitConfig?: PlanTaskTimeLimitConfigDTO;
  taskTimeLimitConfigStr?: string;
  /**
    * 任务类型ID
    */
  taskTypeId?: number;
  /**
    * 任务类型名称
    */
  taskTypeName?: string;
}
export enum TaskStatus {
  // 待接收
  WAIT_RECEIVE = "WAIT_RECEIVE",
  // 待执行
  WAIT_EXECUTE = "WAIT_EXECUTE",
  // 执行中
  EXECUTING = "EXECUTING",
  // 已结束
  FINISHED = "FINISHED",
  // 已终止
  TERMINATED = "TERMINATED",
  // 已过期
  EXPIRED = "EXPIRED"
}
export enum NotificationType {
  DEPT = "DEPT",
  GROUP = "GROUP",
  GROUP_ROLE = "GROUP_ROLE",
  POST = "POST",
  ROLE = "ROLE",
}
export interface PlanTaskTimeLimitConfigDTO {
  day?: number;
  hour?: number;
  minute?: number;
}

export interface ProjectMaterialInfoVO {
  /**
   * 文件信息
   */
  file?: FileVO;
  /**
   * 文件Id
   */
  fileId?: number;
  /**
   * 资料名称
   */
  fileName?: string;
  /**
   * Id
   */
  id?: number;
  /**
   * 上传时间
   */
  uploadTime?: string;
  /**
   * 上传人Id
   */
  uploadUserId?: number;
  /**
   * 上传人名称
   */
  uploadUserName?: string;
}
export interface AreaInfoVO {
  /**
   * 详情
   */
  areaDetail?: string;
  /**
   * 名称
   */
  areaName?: string;
  /**
   * Id
   */
  id?: number;
}
export interface GroupInfoVO {
  /**
     * 组内人数
     */
  count?: number;
  /**
     * 组名称
     */
  groupName?: string;
  /**
     * Id
     */
  id?: string;
  /**
     * 组内人员
     */
  users?: UserDTO[];
}
export interface UserDTO {
  admin?: boolean;
  /**
   * 邮箱地址
   */
  email?: string;
  /**
   * 是否启用
   */
  enabled?: boolean;
  /**
   * 入职日期
   */
  entryDate?: string;
  /**
   * 用户性别
   */
  gender?: Gender;
  /**
   * 主键
   */
  id?: number;
  /**
   * 联系电话
   */
  mobile?: string;
  /**
   * 用户姓名
   */
  name?: string;
  /**
   * 组织机构名称
   */
  organization?: Organization;
  organizations?: Organization[];
  password?: string;
  /**
   * 人员照片业务主键
   */
  photographKey?: number;
  /**
   * 人员照片
   */
  photographList?: FileVO[];
  /**
   * 岗位列表
   */
  positions?: Position[];
  /**
   * 用户备注
   */
  remark?: string;
  /**
   * 角色名称列表
   */
  roles?: Role[];
  tenants?: UserTenantDTO[];
  /**
   * 登录账号
   */
  username?: string;
  /**
   * 工作状态
   */
  workStatus?: string;
}

/**
* 用户性别
*/
export enum Gender {
  FEMALE = "FEMALE",
  MALE = "MALE",
  NONE = "NONE",
}

export interface Organization {
  /**
   * 组织机构主键
   */
  id?: number;
  /**
   * 组织机构名称
   */
  name?: string;
}
export interface Position {
  /**
   * 岗位主键
   */
  id?: number;
  /**
   * 岗位名称
   */
  name?: string;
}

export interface Role {
  /**
   * 角色主键
   */
  id?: number;
  /**
   * 角色名称
   */
  name?: string;
}

export interface UserTenantDTO {
  /**
   * 是否为管理员
   */
  admin?: boolean;
  /**
   * 主键
   */
  id?: number;
  /**
   * 是否为主企业
   */
  mainEnterprise?: boolean;
  /**
   * 是否最近登录
   */
  recentLogin?: boolean;
  /**
   * 租户编号
   */
  tenant?: number;
  /**
   * 用户主键
   */
  userId?: number;
  /**
   * 工作状态
   */
  workStatus?: string;
}
export interface TaskInfoVO {
  /**
   * 附件（保存多个的文件ID）
   */
  appendix?: string;
  projectLeaderName?: string;
  /**
   * 发布人
   */
  createBy?: string;
  createName?: string;
  /**
   * 发布时间
   */
  createTime?: string;
  /**
   * 任务的截止时间
   */
  deadline?: string;
  /**
   * 消杀频次
   */
  disinfectionFrequency?: string;
  /**
   * 执行者小组ID
   */
  executorGroupId?: number;
  /**
   * 执行人id
   */
  executorId?: number;
  /**
   * 执行人
   */
  executorName?: string;
  files?: FileVO[];
  /**
   * 执行小组
   */
  groupName?: string;
  /**
   * Id
   */
  id?: number;
  /**
   * 项目负责人
   */
  leaderName?: string;
  /**
   * 通知的部门ID
   */
  notificationDeptId?: number;
  /**
   * 通知的部门名称
   */
  notificationDeptName?: string;
  /**
   * 通知的小组ID
   */
  notificationGroupId?: number;
  /**
   * 通知的小组名称
   */
  notificationGroupName?: string;
  /**
   * 通知的岗位ID
   */
  notificationPostId?: number;
  /**
   * 岗位名称
   */
  notificationPostName?: string;
  /**
   * 通知的角色ID
   */
  notificationRoleId?: number;
  /**
   * 角色名称
   */
  notificationRoleName?: string;
  /**
   * 通知类型
   */
  notificationType?: NotificationType;
  /**
   * 任务进度
   */
  process?: number;
  /**
   * 项目ID
   */
  projectId?: number;
  /**
   * 项目负责人ID
   */
  projectLeaderId?: number;
  /**
   * 项目名称
   */
  projectName?: string;
  /**
   * 任务状态
   */
  status?: TaskStatus;
  /**
   * 消杀区域ID
   */
  taskAreaId?: number;
  /**
   * 消杀区域ID
   */
  taskAreaName?: string;
  /**
   * 任务名称
   */
  taskName?: string;
  taskTimeLimitConfigStr?: string;
  /**
   * 任务时限配置json（为空表示永不截至）
   */
  taskTimeLimitConfig?: PlanTaskTimeLimitConfigDTO;
  /**
   * 任务类型ID
   */
  taskTypeId?: number;
  /**
   * 任务类型名称
   */
  taskTypeName?: string;
}
export interface TaskCompletionRecordVO {
  appendix?: string;
  createBy?: string;
  createName?: string;
  createTime?: string;
  completionTime?: string;
  executorId?: number;
  executorName?: string;
  files?: FileVO[];
  id?: number;
  placeRecords?: PlaceRecordVO[];
  process?: number;
  taskDesc?: string;
  projectLeaderName?: string;
}

export interface PlaceRecordVO {
  appendix?: string;
  files?: FileVO[];
  placeDetail?: string;
  placeId?: number;
  placeName?: string;
  placeTypeId?: number;
  placeTypeName?: string;
}

export interface KeyPlaceExecuteRecordVO {
  /**
   * 执行人id
   */
  executorId?: number;
  executorName?: string;
  fileIdList?: number[];
  /**
   * 文件
   */
  fileVOList?: FileVO[];
  id?: number;
  /**
   * 重点场所id
   */
  keyPlaceId?: number;
  /**
   * 场所地址
   */
  placeAddress?: string;
  /**
   * 场所名称
   */
  placeName?: string;
  /**
   * 场所分类ID
   */
  placeTypeId?: number;
  /**
   * 场所分类名称
   */
  placeTypeName?: string;
  /**
   * 描述
   */
  taskDesc?: string;
}
export interface ProjectProductStatisticsVO {
  /**
   * 项目名称
   */
  productType?: string;
  /**
   * 项目产品数量
   */
  count?: number;

}
export interface ProjectProductTrendsVO {
  /**
   * 日期
   */
  date?: string;
  /**
   * 项目产品数量
   */
  count?: number;

}