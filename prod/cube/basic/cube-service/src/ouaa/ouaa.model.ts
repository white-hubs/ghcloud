export interface GetTokenRequest {
  // 验证码 key
  key: string;
  // 验证码
  code: string;
  username: string;
  password: string;
}

/**
 * 登陆验证通过的 token
 */
export interface Token {
  userID: string;
  accessToken: string;
  refreshToken: string;
  tenants: string[];
}

/**
 * 验证码
 */
export interface ValidateCode {
  // 验证码
  code: string;
  // 本次验证码 key
  key: string;
}

export interface ApplicationGroup {
  id: string;
  name: string;
  apps: Application[];
}

export interface Application {
  id: string;
  name: string;
  icon: string;
  code: string;
}

export interface Tenant {
  id: string;
  code: number;
  name: string;
  address: string;
  remark: string;
  location: string;
}
/**
 * 部门返回
 */
export interface DepartmentQuery {
  enabled: boolean;
  name: string;
}
export interface Department {
  children: Department;
  enabled: boolean;
  id: string;
  level: number;
  members: null | string;
  name: string;
  parentId: string;
  remark: string;
  sequence: string;
}
/**
 * 角色
 */

export interface RoleQuery {
  keyword: string;
  cascaderIds: string;
  pageNumber: number;
  pageSize: number;
  enabled: boolean;
}
export interface RoleList {
  data: {
    total: number;
    page: number;
    records: Role[];
  };

}
export interface TerminalsData {
  id: boolean;
  productId: string;
  code: string;
  name: string;
  remark: string;
  enabled: boolean;
}
export interface Terminals {
  data: {
    id: boolean;
    productId: string;
    code: string;
    name: string;
    remark: string;
    enabled: boolean;
  }[];
}
export interface Role {

  id: string;
  code: string;
  name: string;
  enabled: boolean;
  product: null | string;
  remark: string;

}
export interface UserQuery {
  organizationId: string | undefined;
  keyword: string;
  cascaderIds: string;
  pageNumber: number;
  pageSize: number;
  enabled: boolean;
}
export interface User {
  id: string;
  name: string;
  mobile: string;
  gender: 'NONE' | 'MALE';
  organizations: {
    id: string;
    name: string;
  }[];
}
export interface UserList {
  data: {
    total: number;
    page: number;
    records: User[];
  };
}

export interface MessageTwoType {
  id: string;
  msgSceneCode: string;
  msgSceneName: string;
  applicationCode: string;
  applicationName: string;
  channelCodes: string[];

}
