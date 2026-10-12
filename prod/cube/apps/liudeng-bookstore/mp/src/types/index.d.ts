export interface AuthInfo{
  access_token: string;
  admin: boolean;
  administrated_tenants: unknown;
  expires_in: number;
  id: string;
  jti: string;
  name: string;
  password_expiration_date: number;
  password_expiration_reminded: boolean;
  password_expired: boolean;
  password_forced: boolean;
  refresh_token: string;
  scope: string;
  tenants: string[];
  token_type: string;
}

export interface UserInfo {
  createTime?: number;
  enabled?: boolean;
  fileVO?: FileState;
  gender?: string;
  id?: string;
  lastLoginTime?: number;
  managedOrganizations?: []
  mobile?: string;
  name?: string;
  nickName?: string;
  organizations?:{id:string; name:string;}[];
  password?: string;
  positions?: {id:string; name:string;}[];
  remark?: string;
  roles?: {id:string; name:string;}[];
  tenants?: string[];
  username?: string;

}

/**
 * 公告类型
 */
export enum InformationType {
  Announcement = "ANNOUNCEMENT",
  NewInformation = "NEW_INFORMATION",
}

export interface Notice {
  id: string;
  fileVOS: unknown;
  createTime: number;
  content: string;
  tagName: string;
  title: string;
}

export interface Reservation {
  /**
   * 预约区域id
   */
  areaId: string;
  /**
   * 预约区域名称
   */
  areaName: string;
  /**
   * 创建时间
   */
  createTime: number;
  /**
   * 预约日期字符串
   */
  dayStr: string;
  /**
   * 结束时间
   */
  endTime: number;
  /**
   * 主键id
   */
  id: number;
  /**
   * 姓名
   */
  name: string;
  /**
   * 预约时间段字符串
   */
  periodStr: string;
  timeStr: string;
  /**
   * 手机
   */
  phone: string;
  /**
   * 开始时间
   */
  startTime: number;
  /**
   * 状态，// 状态 0：待审核 1：预约 2：在访 3：离访 4:预约取消
   */
  status: number;
}
export interface FileState {
  businessKey?: string | null;
  id?: string | null;
  name?: null | string;
  path?: null | string;
  refCount?: number | null;
  size?: number | null;
  suffix?: null | string;
  type?: null | string;
}

