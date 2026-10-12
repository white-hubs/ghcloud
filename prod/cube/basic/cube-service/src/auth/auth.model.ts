export enum CubeTerminalEnum {
  /**
   * 业务端
   */
  BUSINESS = 'bimops-manage-web'
}

export interface CubeAuth {
  /**
   * 租户 id
   */
  tenant: string;
  /**
   * 当前登陆用户 id
   */
  userID: string;
  /**
   * 鉴权 token 信息 (`{{access_token}}`)
   */
  authorization: string;
}

export interface CubeUser {
  id: string;
  name: string;
  mobile: string;
  organizations: string[];
  roles: CubeRole[];
}

export interface CubeRole {
  id: string;
  name: string;
}
