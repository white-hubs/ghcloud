import type { Menu } from './ouaa.service'

export interface Organization {
  id: string;
  name: string;
}

export interface Position {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface AppointmentList {
  id: string;
  name: string;
  remark: string;
  enable: boolean;
  updateTime: number;
}

export interface PersonItem {
  id: string;
  name: string;
  mobile: string;
  gender: string;
  workStatus: string;
  remark: string;
  username: string;
  password: string;
  enabled: boolean;
  entryDate?: unknown;
  photographKey?: unknown;
  organizations: Organization[];
  managedOrganizations: unknown[];
  organization: { id: string;name: string; };
  positions: Position[];
  roles: Role[];
  createTime: number;
  lastLoginTime: number;
  fileVO?: { path: string; };
  appointmentIds: unknown[];
  appointmentList: AppointmentList[];
  photographList: unknown[];
  tenants: unknown[];
}

export interface PositionItem {
  /**
   * 是否启用
   */
  enabled: string;
  /**
   * 主键
   */
  id: string;
  /**
   * 岗位名称
   */
  name: string;
  /**
   * 岗位备注
   */
  remark: string;
}
export interface ApplicationGroup {
  id: string;
  name: string;
  code: string;
  applicationPageVOS: Application[];
}
export interface Application {
  id: string;
  name: string;
  icon: string;
  code: string;
  alias: string;
}

export interface TenantClient {
  accessTokenTimeout: number;
  code: string;
  enabled: boolean;
  grantTypes: string;
  id: string;
  name: string;
  refreshTokenTimeout: number;
  remark: string;
  scopes: string;
  secretPlain: string;
  tenants: number[];
}

export interface ApplicationPageVO {
  'id': string;
  'code': string;
  'name': string;
  'icon': string;
  'remark': string;
  'enabled': boolean;
  'sort': number | null;
  'applicationGroupId': string;
  'applicationGroupName': string;
  'createTime': number;
  'updateTime': number;
  'path': string;
  'menuVOS': Menu[];
  'lastVisitTime': number;
  'alias': string;
}
export interface Terminal {
  /**
   * 访问端编号
   */
  code: string;
  /**
   * 是否启用
   */
  enabled: boolean;
  id: number;
  /**
   * 访问端名称
   */
  name: string;
  /**
   * 产品主键
   */
  productId: number;
  /**
   * 访问端备注
   */
  remark: string;
  /**
   * 别名
   */
  alias: string;
}


export const GENDER =  {
  'MALE': '男',
  'FEMALE': '女',
  "NONE": "未知"
}
export interface UserDTO {
  admin?: boolean;
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
  Female = "FEMALE",
  Male = "MALE",
  None = "NONE",
}

export interface FileVO {
  /**
   * 业务主键
   */
  businessKey?: number;
  createTime?: string;
  endpointPath?: string;
  /**
   * 主键
   */
  id?: number;
  /**
   * 文件名
   */
  name?: string;
  /**
   * URL地址
   */
  path?: string;
  /**
   * 关联数量
   */
  refCount?: number;
  /**
   * 文件大小
   */
  size?: number;
  /**
   * 文件名后缀
   */
  suffix?: string;
  /**
   * 文件类型
   */
  type?: string;
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

export interface LicenseInfo{
  subject:string;
  description:string;
  expiryTime:string;
  issuedTime:string;
  expiryDays:number;
}
export interface ReqGet {
  repCode: string;
  repData: {
    originalImageBase64: string;
    jigsawImageBase64: string;
    token: string;
    secretKey: string;
  } | null;
  repMsg: string;
}