import type { Dayjs } from 'dayjs'
/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}

/**
* 用户信息
*
*/
export interface UserVO {
  appointmentIds?: Appointment[] | null;
  appointmentList?: AppointmentDetailVO[] | null;
  /**
   * 注册时间
   */
  createTime?: null | string;
  /**
   * 是否启用
   */
  enabled?: boolean | null;
  /**
   * 入职日期
   */
  entryDate?: null | string;
  /**
   * 文件信息
   */
  fileVO?: FileVO;
  /**
   * 用户性别
   */
  gender?: Gender;
  /**
   * 主键
   */
  id?: number | null;
  /**
   * 最后登录时间
   */
  lastLoginTime?: null | string;
  /**
   * 管理的部门
   */
  managedOrganizations?: Organization[] | null;
  /**
   * 联系电话
   */
  mobile?: null | string;
  /**
   * 用户姓名
   */
  name?: null | string;
  /**
   * 组织机构名称
   */
  organization?: Organization;
  /**
   * 组织机构名称
   */
  organizations?: Organization[] | null;
  /**
   * 用户密码
   */
  password?: null | string;
  /**
   * 照片主键
   */
  photographKey?: number | null;
  /**
   * 照片集合
   */
  photographList?: FileVO[] | null;
  /**
   * 岗位列表
   */
  positions?: Position[] | null;
  /**
   * 用户备注
   */
  remark?: null | string;
  /**
   * 角色名称列表
   */
  roles?: Role[] | null;
  /**
   * 租户集合
   */
  tenants?: UserTenant[] | null;
  /**
   * 登录账号
   */
  username?: null | string;
  /**
   * 工作状态
   */
  workStatus?: null | string;
}

/**
* Appointment
*/
export interface Appointment {
  createBy?: null | string;
  createTime?: null | string;
  deleted?: boolean | null;
  /**
   * 启停用状态
   */
  enable?: boolean | null;
  id?: number | null;
  /**
   * 名称
   */
  name?: null | string;
  /**
   * 描述
   */
  remark?: null | string;
  tenant?: number | null;
  updateBy?: null | string;
  updateTime?: null | string;
}

/**
* AppointmentDetailVO
*/
export interface AppointmentDetailVO {
  /**
   * 启停用状态
   */
  enable?: boolean | null;
  id?: number | null;
  /**
   * 名称
   */
  name?: null | string;
  /**
   * 描述
   */
  remark?: null | string;
  /**
   * 更新时间
   */
  updateTime?: null | string;
}

/**
* 文件信息
*
* FileVO
*
* com.guhecloud.cube.base.file.client.vo.FileVO
*/
export interface FileVO {
  /**
   * 业务主键
   */
  businessKey?: number | null;
  /**
   * 内网地址
   */
  endpointPath?: null | string;
  /**
   * 主键
   */
  id?: number | null;
  /**
   * 文件名
   */
  name?: null | string;
  /**
   * URL地址
   */
  path?: null | string;
  /**
   * 关联数量
   */
  refCount?: number | null;
  /**
   * 文件大小
   */
  size?: number | null;
  /**
   * 文件名后缀
   */
  suffix?: null | string;
  /**
   * 文件类型
   */
  type?: null | string;
}

/**
* 用户性别
*/
export enum Gender {
  Female = "FEMALE",
  Male = "MALE",
  None = "NONE",
}

/**
* 组织机构信息
*
* Organization
*
* 组织机构名称
*/
export interface Organization {
  /**
   * 组织机构主键
   */
  id?: number | null;
  /**
   * 组织机构名称
   */
  name?: null | string;
}

export interface Position {
  /**
   * 岗位主键
   */
  id?: number | null;
  /**
   * 岗位名称
   */
  name?: null | string;
}

/**
* 角色信息
*
*/
export interface Role {
  /**
   * 角色主键
   */
  id?: number | null;
  /**
   * 角色名称
   */
  name?: null | string;
}

/**
* 用户租户关联数据模型
*
* UserTenant
*/
export interface UserTenant {
  /**
   * 是否为管理员
   */
  admin?: boolean | null;
  /**
   * 主键
   */
  id?: number | null;
  /**
   * 是否为主企业
   */
  mainEnterprise?: boolean | null;
  /**
   * 是否最近登录
   */
  recentLogin?: boolean | null;
  /**
   * 租户编号
   */
  tenant?: number | null;
  /**
   * 用户主键
   */
  userId?: number | null;
  /**
   * 工作状态
   */
  workStatus?: null | string;
}