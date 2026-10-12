import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import type {
  Application,
  ApplicationPageVO,
  LicenseInfo,
  PersonItem,
  PositionItem,
  ReqGet,
  TenantClient,
  Terminal,
  UserDTO,
  UserTenantDTO,
} from "./type";

const baseURL = `${BASE_API}`;

export interface DeptList {
  id: string;
  parentId: string;
  level: number;
  name: string;
  remark: string;
  members: null;
  enabled: boolean;
  sequence: string;
  children?: DeptList[];
}

export interface AreaTree {
  parentId: string;
  id: string;
  level: number;
  name: string;
  code: string;
  sequence: string;
  aliasName: string;
  sort: number;
  builtUpArea: string | null;
  areaManagerId: string;
  areaDepartmentId: string;
  areaManagerIds: string[];
  areaManagerName: string[];
  children: AreaTree[];
}

export interface TenantInfo {
  address: string;
  areaCovered: string;
  building: number;
  code: string;
  enabled: string;
  files: Record<string, unknown>[];
  floorArea: string;
  id: string;
  lntAndLat: string;
  locations: string[];
  logo: Record<string, unknown>;
  logoId: string | null;
  name: string;
  remark: string;
  serviceHotLine: string;
  username: string;
}

export interface PostAndPosition {
  positionList: PositionList[];
  postList: unknown[];
}
export interface MenuInfo {
  path: string | number | symbol;
  name: string;
  icon: string;
}

export interface PositionList {
  createBy: string;
  createTime: number;
  deleted: boolean;
  enabled: boolean;
  extension: string;
  id: string;
  name: string;
  remark: string;
  sort: number;
  tenant: number;
  updateBy: string;
  updateTime: number;
}
export interface TenantVo {
  id: string;
  code: string;
  name: string;
  userAdminId: string;
  username: string;
  address: string;
  locations: unknown[];
  building: number;
  areaCovered: number;
  logo?: unknown;
  logoId?: string;
  files: unknown[];
  fileIds: string[];
  remark: string;
  enabled: boolean;
  createTime: number;
  updateTime: number;
  recentLogin?: unknown;
  mainEnterprise?: unknown;
  admin?: unknown;
  productVOS: unknown[];
  floorArea?: unknown;
  serviceHotLine: string;
  lntAndLat: string;
}
export interface UserInfo {
  id: string;
  code: string;
  name: string;
  mobile: string;
  gender: "MALE" | "FEMALE" | "NONE";
  workStatus: string;
  remark: string;
  enabled: boolean;
  entryDate: string | null;
  photographKey: string | null;
  organizations: { id: string; name: string }[];
  managedOrganizations: { id: string; name: string }[];
  organization: { id: string; name: string } | null;
  roles: { id: string; name: string }[];
  positions: { id: string; name: string }[];
  createTime: number;
  fileId: string | null;
  lastLoginTime: number;
  fileVO: {
    id: string;
    name: string;
    path: string;
  } | null;
  tenants: string[];
}
export interface GetUserTerminals {
  id: string;
  productId: string;
  code: string;
  name: string;
  remark: string;
  enabled: boolean;
  alias: string;
}
export interface RoleItem {
  id: string;
  code: string;
  name: string;
  type: string;
  extentConfig: string;
}

export interface Menu {
  applicationCode: string;
  applicationId: string;
  applicationName: string;
  categoryId: string | null;
  categoryName: string;
  children: Menu[];
  code: string;
  dataPermissions: unknown[];
  enabled: boolean;
  fileVO: unknown;
  functions: unknown[];
  icon: string;
  id: string;
  level: number;
  name: string;
  parentId: string | null;
  path: string;
  remark: string;
  sort: number;
  terminalId: string;
}

export interface FrequentMenu {
  id: string | number;
  code: string;
  name: string;
  icon: string;
  applicationCode: string;
  applicationName: string;
  path: string;
  visitCount: number;
}

export interface WXTokenResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  openId: string;
  scope: string;
  isSnapshotUser: number;
  unionid: string;
}

export class CubeOuaaService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 部门 */
  public async getDeptList(params?: { enabled?: boolean; tenant?: string | undefined; ids?: string[] | undefined }): Promise<DeptList[]> {
    const url = `${baseURL}/ouaa/authenticated/organizations/list`;
    const headers = params?.tenant ? { headers: { tenant: params?.tenant } } : {};
    const resp = await this.gateway.custom<LegacyServiceError<DeptList[]>>({
      url,
      query: params,
      method: "GET",
      ...headers,
    });
    return resp.data || resp;
  }
  /** 部门 */
  public async getDept(params?: { enabled?: boolean; tenant?: string | undefined; ids?: string[] | undefined }): Promise<DeptList[]> {
    const url = `${baseURL}/ouaa/authenticated/organizations`;
    const headers = params?.tenant ? { headers: { tenant: params?.tenant } } : {};
    const resp = await this.gateway.custom<LegacyServiceError<DeptList[]>>({
      url,
      query: params,
      method: "GET",
      ...headers,
    });
    return resp.data || resp;
  }

  /** 根据部门id获取岗位 */
  public async getPostAndPosition(deptId: string): Promise<PostAndPosition> {
    const url = `${baseURL}/ouaa/organizations/postAndPosition/${deptId}`;
    const resp = await this.gateway.get<LegacyServiceError<PostAndPosition>>({ url });
    return resp.data || resp;
  }

  /** 企业信息 */
  public async getTenantInfo(code: string): Promise<TenantInfo> {
    const url = `${baseURL}/ouaa/tenant-under-tenant/${code}`;
    const resp = await this.gateway.get<LegacyServiceError<TenantInfo>>({ url });
    return resp.data || resp;
  }

  /** 区域 */
  public async getAreaTree(tenant?: string | undefined): Promise<AreaTree[]> {
    const url = `${baseURL}/mdata/area/list`;
    const headers = tenant ? { headers: { tenant } } : {};
    const resp = await this.gateway.custom<LegacyServiceError<AreaTree[]>>({
      url,
      query: { tenant },
      method: "GET",
      ...headers,
    });
    return resp.data || resp;
  }

  /** 分页获取用户列表 */
  public async getStaffPage(params: {
    pageSize: number;
    pageNumber: number;
    keyword?: string | undefined;
    enabled?: boolean | undefined;
    organizationId?: string | undefined;
    positionId?: string | undefined;
    roleId?: string | undefined;
    workStatus?: string | undefined;
  }): Promise<{ records: PersonItem[]; total: number; pages: number }> {
    const url = `${baseURL}/ouaa/authenticated/user-under-tenant/page`;

    const resp = await this.gateway.get<LegacyServiceError<{ records: PersonItem[]; total: number; pages: number }>>({
      url,
      payload: params,
    });
    return resp.data || resp;
  }

  /** 获取当前用户信息 */
  public async getUserMine(): Promise<{ name: string; mobile: string; id: string }> {
    const url = `${baseURL}/ouaa/user/mine`;
    const resp = await this.gateway.get<LegacyServiceError<{ name: string; mobile: string; id: string }>>({ url });
    return resp.data || resp;
  }

  /** 获取当前租户开通的子应用 */
  public async productApplications(tenant: string, alisaFlag?: boolean): Promise<Application[]> {
    const url = `${baseURL}/ouaa/tenant-under-tenant/${tenant}/product-applications`;
    const resp = await this.gateway.get<LegacyServiceError<Application[]>>({ url, payload: { alisaFlag } });
    return resp.data || resp || resp;
  }

  /** 获取当前用户拥有的应用列表 */
  public async getTerminalApplications(terminal?: string): Promise<Application[]> {
    const url = `${baseURL}/ouaa/context/terminal-applications`;
    const headers = terminal ? { headers: { terminal } } : {};
    const resp = await this.gateway.custom<LegacyServiceError<Application[]>>({
      url,
      method: "GET",
      ...headers,
    });
    return resp.data || resp;
  }

  /** 获取当前用户所登录产品的访问端列表 */
  public async getTerminals(): Promise<Terminal[]> {
    const url = `${baseURL}/ouaa/context-terminals`;
    const resp = await this.gateway.custom<LegacyServiceError<Terminal[]>>({
      url,
      method: "GET",
    });
    return resp.data || resp;
  }

  /** 用户信息  只能获取当前用户 */
  public async getUserInfo(): Promise<UserInfo> {
    const url = `${baseURL}/ouaa/context/user`;
    const resp = await this.gateway.get<LegacyServiceError<UserInfo>>({ url });
    return resp.data || resp;
  }
  /** 用户信息  用户绑定微信 */
  public async bindWechat(payload: { code: string }): Promise<boolean> {
    const url = `${baseURL}/ouaa/user/wechat/bind`;
    const resp = await this.gateway.update<LegacyServiceError<boolean>>({ url, payload });
    return resp.data || resp;
  }
  /** 用户信息  用户解绑微信 */
  public async unbindWechat(): Promise<boolean> {
    const url = `${baseURL}/ouaa/user/wechat/unbind`;
    const resp = await this.gateway.update<LegacyServiceError<boolean>>({ url });
    return resp.data || resp;
  }
  /** 用户信息  修改当前用户信息 */
  public async updateUserInfo(params: UserInfo): Promise<UserInfo> {
    const url = `${baseURL}/ouaa/authenticated/user`;
    const payload: Record<string, unknown> = { ...params };
    const resp = await this.gateway.update<LegacyServiceError<UserInfo>>({ url, payload });
    return resp.data || resp;
  }

  /** 获取用户信息 */
  public async getPersonInfo(userId: string): Promise<UserInfo> {
    const url = `${baseURL}/ouaa/user-under-tenant/${userId}`;
    const resp = await this.gateway.get<LegacyServiceError<UserInfo>>({ url });
    return resp.data || resp;
  }

  /** 应用信息 返回的信息跟header里的terminal有关系 */
  public async getAppMenuInfo(applicationCode: string, terminal?: string, alisaFlag?: boolean): Promise<Menu[]> {
    const url = `${baseURL}/ouaa/context/terminal-application-menus`;
    const headers = terminal ? { headers: { terminal } } : {};
    const resp = await this.gateway.custom<LegacyServiceError<Menu[]>>({
      url,
      query: { applicationCode, alisaFlag },
      method: "GET",
      ...headers,
    });
    return resp.data || resp || resp;
  }

  /** 租户列表 */
  public async getTenantsPage(params: {
    pageSize: number;
    pageNumber: number;
    name?: string;
    enabled?: boolean;
  }): Promise<{ total: number; records: TenantVo[]; page: number }> {
    const url = `${baseURL}/ouaa/tenant/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ total: number; records: TenantVo[]; page: number }>>({ url, payload: params });
    return resp.data || resp;
  }

  /** 获取我的企业 */
  public async getMyTenants(): Promise<UserInfo[]> {
    const url = `${baseURL}/ouaa/tenant/mine`;
    const resp = await this.gateway.get<LegacyServiceError<UserInfo[]>>({ url });
    return resp.data || resp;
  }

  /** 岗位 */
  public async getPositionList(params?: { enabled?: boolean; name?: string }): Promise<PositionItem[]> {
    const url = `${baseURL}/ouaa/appointment/list`;
    const resp = await this.gateway.get<LegacyServiceError<PositionItem[]>>({ url, payload: params });
    return resp.data || resp;
  }

  /** 角色 */
  public async getRole(params?: { enabled?: boolean; keyword?: string }): Promise<RoleItem[]> {
    const url = `${baseURL}/ouaa/authenticated/role/list-by-product`;
    const resp = await this.gateway.get<LegacyServiceError<RoleItem[]>>({ url, payload: params });
    return resp.data || resp;
  }

  /**
   * 获取角色权限
   * @param payload
   * id 角色id
   * @returns
   */
  public async getRolePermissions(payload: { id: string }): Promise<RoleItem> {
    const url = `${baseURL}/ouaa/role-permissions/${payload.id}`;
    const resp = await this.gateway.get<LegacyServiceError<RoleItem>>({ url });
    return resp.data || resp;
  }

  /**
   * 获取当前租户下的用户列表
   * /authenticated/user-under-tenant/list
   */
  public async getUserList(payload: { keyword?: string; enabled?: boolean }): Promise<UserInfo[]> {
    const url = `${baseURL}/ouaa/authenticated/user-under-tenant/list`;
    const resp = await this.gateway.get<LegacyServiceError<UserInfo[]>>({ url, payload });
    return resp.data || resp;
  }

  /**
   * 条件获取当前租户下的用户列表
   * /authenticated/user-under-tenant/list
   */
  public async getUserListFormDept(payload: { keyword?: string; enabled?: boolean; organizationId?: string }): Promise<UserInfo[]> {
    const url = `${baseURL}/ouaa/authenticated/user-under-tenant/list`;
    const resp = await this.gateway.get<LegacyServiceError<UserInfo[]>>({ url, payload });
    return resp.data || resp;
  }
  /**
   * 获取当前角色下的用户列表
   * @param payload
   * @returns
   */
  public async getRoleUserList(payload: { roleIds: string; keyword?: string }): Promise<unknown> {
    const url = `${baseURL}/ouaa/authenticated/role/user/list`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }
  /** 查询当前租户下用户 */
  public async getTenantUserList(
    payload: {
      enabled?: boolean;
      keyword?: string;
      organizationIds?: string[];
      roleIds?: string[];
      userIds?: string[];
    },
    method: "get" | "post" = "get",
  ): Promise<UserDTO[]> {
    const url = `${baseURL}/ouaa/tenant/user/list`;
    if (method === "post") {
      const resp = await this.gateway.custom<LegacyServiceError<UserDTO[]>>({ method: "POST", url, payload });
      return resp.data || resp;
    }
    const resp = await this.gateway.get<LegacyServiceError<UserDTO[]>>({ url, payload });
    return resp.data || resp;
  }

  /**
   * 更新角色扩展数据权限
   * @param payload
   * @returns
   */

  public async saveUserDataRole(payload: { roleId: string; codes: { code: string; extentConfig?: string }[] }): Promise<unknown> {
    const url = `${baseURL}/ouaa/role-permission/${payload.roleId}/extend`;
    const resp = await this.gateway.update<LegacyServiceError<unknown>>({ url, payload: payload.codes });
    return resp.data || resp;
  }

  /**
   * 更新角色按钮权限
   * @param payload
   * @returns
   */
  public async saveUserFunRole(payload: { roleId: string; codes: { code: string; extentConfig?: string }[] }): Promise<unknown> {
    const url = `${baseURL}/ouaa/role-permission/${payload.roleId}`;
    const resp = await this.gateway.update<LegacyServiceError<unknown>>({ url, payload: payload.codes });
    return resp.data || resp;
  }

  /**
   * 获取登录用户有当前租户下拥有的访问端列表
   * @param payload
   * @returns
   */
  public async getUserTerminals(): Promise<GetUserTerminals[]> {
    const url = `${baseURL}/ouaa/context/user/terminals`;
    const resp = await this.gateway.get<LegacyServiceError<GetUserTerminals[]>>({ url });
    return resp.data || resp;
  }

  /** 根据appCode获取应用信息 */
  public async getApplicationInfo(appCode: string): Promise<Application> {
    const url = `${baseURL}/ouaa/context/application/${appCode}`;
    const resp = await this.gateway.get<LegacyServiceError<Application>>({
      url,
    });
    return resp.data || resp;
  }

  public async getApplicationGroups(terminal?: string): Promise<
    {
      id: string;
      name: string;
      remark: string;
      applicationPageVOS: Application[];
    }[]
  > {
    const url = `${baseURL}/ouaa/context/terminal-application-groups`;
    const headers = terminal ? { headers: { terminal } } : {};
    const resp = await this.gateway.custom<
      LegacyServiceError<
        {
          id: string;
          name: string;
          remark: string;
          applicationPageVOS: Application[];
        }[]
      >
    >({
      url,
      method: "GET",
      ...headers,
    });
    return resp.data || resp || resp;
  }

  /** 获取客户端授权列表 */
  public async getTenantClientPage(payload: {
    /**
     * 启用状态,true:启用,false:禁用
     */
    enabled?: boolean;
    /**
     * 关键字
     */
    keyword?: string;
    /**
     * 页码
     */
    pageNumber: number;
    /**
     * 页大小
     */
    pageSize: number;
  }): Promise<{ records: TenantClient[]; total: number; pages: number }> {
    const url = `${baseURL}/ouaa/tenant-client/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: TenantClient[]; total: number; pages: number }>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  /** 新增租户客户端配置 */
  public async createTenantClient(payload: {
    /**
     * 生成令牌的超时时间，单位:秒
     */
    accessTokenTimeout: number;
    /**
     * 启用状态，true:启用,false:禁用
     */
    enabled: boolean;
    /**
     * 授权类型，client_credentials ：客户端
     * refresh_token ：刷新token
     * pwd：用户名密码
     * wechat ：微信登录
     * pwd_simple_code ： 用户名密码加验证码
     * exchange_token ：短token方式
     * client_credentials_user : 客户端加用户名方式
     */
    grantTypes: string;
    /**
     * 客户端名称
     */
    name: string;
    /**
     * 刷新令牌的超时时间，单位:秒
     */
    refreshTokenTimeout: number;
    /**
     * 客户端备注
     */
    remark?: string;
    /**
     * 资源范围，默认值为(select)（多个范围之间使用","号隔开）
     */
    scopes: string;
  }): Promise<DeptList[]> {
    const url = `${baseURL}/ouaa/tenant-client`;
    const resp = await this.gateway.create<LegacyServiceError<DeptList[]>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  /** 删除授权配置 */
  public async deleteTenantClient(code: string): Promise<void> {
    const url = `${baseURL}/ouaa/tenant-client/${code}`;
    await this.gateway.delete({ url });
  }

  /** 更新授权配置 */
  public async updateTenantClient(payload: {
    /**
     * 生成令牌的超时时间，单位:秒
     */
    accessTokenTimeout: number;
    /**
     * 启用状态，true:启用,false:禁用
     */
    enabled: boolean;
    /**
     * 授权类型，client_credentials ：客户端
     * refresh_token ：刷新token
     * pwd：用户名密码
     * wechat ：微信登录
     * pwd_simple_code ： 用户名密码加验证码
     * exchange_token ：短token方式
     * client_credentials_user : 客户端加用户名方式
     */
    grantTypes: string;
    /**
     * 客户端名称
     */
    name: string;
    /**
     * 刷新令牌的超时时间，单位:秒
     */
    refreshTokenTimeout: number;
    /**
     * 客户端备注
     */
    remark?: string;
    /**
     * 资源范围，默认值为(select)（多个范围之间使用","号隔开）
     */
    scopes: string;
    code: string;
  }): Promise<DeptList[]> {
    const url = `${baseURL}/ouaa/tenant-client/${payload.code}`;
    const resp = await this.gateway.update<LegacyServiceError<DeptList[]>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  /** 获取授权配置 */
  public async getTenantClient(code: string): Promise<TenantClient> {
    const url = `${baseURL}/ouaa/tenant-client/${code}`;
    const resp = await this.gateway.get<LegacyServiceError<TenantClient>>({ url });
    return resp.data || resp;
  }

  /** 新增业务应用访问记录 */
  public async createApplicationAccess(applicationCode: string): Promise<void> {
    const url = `${baseURL}/ouaa/context/application/visit/history/save?applicationCode=${applicationCode}`;
    await this.gateway.create<LegacyServiceError<TenantClient>>({ url });
  }

  /** 获取当前用户的常用业务菜单。 */
  public async getFrequentMenus(): Promise<FrequentMenu[]> {
    const url = `${baseURL}/ouaa/context/frequent-menus`;
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>[]>>({ url });
    const data = resp.data || resp;
    return data.map(toFrequentMenu);

    function toFrequentMenu(menu: Record<string, unknown>): FrequentMenu {
      return {
        id: menu.id as string | number,
        code: menu.code as string,
        name: menu.name as string,
        icon: menu.icon as string,
        applicationCode: menu.applicationCode as string,
        applicationName: menu.applicationName as string,
        path: menu.path as string,
        visitCount: menu.visitCount as number,
      };
    }
  }

  /** 保存当前用户进入菜单的访问记录。 */
  public async saveMenuVisitHistory(menuId: string | number): Promise<void> {
    const url = `${baseURL}/ouaa/context/menu/visit/history/save`;
    await this.gateway.custom<void>({
      url,
      method: "POST",
      query: { menuId },
      responseType: "void",
    });
  }

  /** 批量查询应用分组下的所有应用菜单 */
  public async getApplicationMenusByGroupId(applicationGroupId: string): Promise<ApplicationPageVO[]> {
    const url = `${baseURL}/ouaa/context/application/group/menus?id=${applicationGroupId}`;
    const resp = await this.gateway.get<ApplicationPageVO[]>({ url });
    return resp;
  }

  /** 通过code鉴权获取token */
  public async getTokenByCode(code: string): Promise<string> {
    const url = `${baseURL}/ouaa/public/get/accesstoken/${code}`;
    const resp = await this.gateway.get<string>({ url });
    return resp;
  }

  /** 公众号通过code换取网页授权access_token */
  public async getWeChatAccessToken(code: string): Promise<WXTokenResponse> {
    const url = `${baseURL}/ouaa/user/wechat/sns/oauth2/access-token?code=${code}`;
    const resp = await this.gateway.get<WXTokenResponse>({ url });
    return resp;
  }

  /** 保存用户微信信息 */
  public async bindWeChat(payload: {
    /**
     * 微信openid
     */
    openId: string;
    /**
     * 微信unionid
     */
    unionId: string;
    /**
     * 配置id
     */
    configId: string;
  }): Promise<string> {
    const url = `${baseURL}/ouaa//user/wechat`;
    const resp = await this.gateway.create<string>({ url, payload });
    return resp;
  }

  // 用户管理接口 - 修改用户密码
  public async modifyPassword(payload: { id: string; password: string; newPassword: string; secondNewPassword: string }): Promise<string> {
    const url = `${baseURL}/ouaa//user/${payload.id}/new-password`;
    const resp = await this.gateway.update<string>({ url, payload });
    return resp;
  }

  // 设置主企业 - 设置主企业
  public async setEnterprise(tenant: number): Promise<string> {
    const url = `${baseURL}/ouaa/tenant/${tenant}/main-enterprise`;
    const resp = await this.gateway.update<string>({ url });
    return resp;
  }

  // 员工导出
  public async getUsersExcel(payload?: {
    appointmentId?: number;
    enabled?: boolean;
    filterUserIds?: string;
    gender?: string;
    ids?: string;
    isAdmin?: boolean;
    keyword?: string;
    organizationId?: number;
    positionId?: string;
    roleId?: string;
    workStatus?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<Blob> {
    const url = `${baseURL}/ouaa/user-under-tenant/export`;
    const res = await this.gateway.customBlob({ method: "GET", url, payload });
    return res;
  }

  // 职位导出
  public async getPositionExcel(payload?: { enabled?: boolean; name?: string; pageNumber?: number; pageSize?: number }): Promise<Blob> {
    const url = `${baseURL}/ouaa/appointment/export`;
    const res = await this.gateway.customBlob({ method: "GET", url, payload });
    return res;
  }

  // 部门导出
  public async getOrganizationsExcel(payload?: { enabled?: boolean; ids?: string; name?: string }): Promise<Blob> {
    const url = `${baseURL}/ouaa/organizations/export`;
    const res = await this.gateway.customBlob({ method: "GET", url, payload });
    return res;
  }

  // 岗位导出
  public async getAppointmentExcel(payload?: {
    enable?: boolean;
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<Blob> {
    const url = `${baseURL}/ouaa/position/export`;
    const res = await this.gateway.customBlob({ method: "GET", url, payload });
    return res;
  }

  // 导出角色列表
  public async getRoleExcel(payload?: {
    builtin?: boolean;
    enabled?: boolean;
    keyword?: string;
    name?: string;
    productId?: number;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<Blob> {
    const url = `${baseURL}/ouaa/role/export`;
    const res = await this.gateway.customBlob({ method: "GET", url, payload });
    return res;
  }
  // 导出角色列表
  public async getRoleExcelNew(): Promise<Blob> {
    const url = `${baseURL}/ouaa/permission/export`;
    const res = await this.gateway.customBlob({ method: "GET", url });
    return res;
  }

  /** 获取授权证书基本信息 */
  public async getLicenseInfo(): Promise<LicenseInfo> {
    const url = `${baseURL}/ouaa/public/license`;
    const res = await this.gateway.get<LicenseInfo>({ url });
    return res;
  }

  // 滑块验证
  public async reqGet(payload?: { captchaType?: string }): Promise<ReqGet> {
    const url = `${baseURL}/ouaa/captcha/get`;
    const res = await this.gateway.create<ReqGet>({ url, payload });
    return res;
  }

  // 滑块验证
  public async reqCheck(payload?: { captchaType: string; pointJson: string; token: string }): Promise<ReqGet> {
    const url = `${baseURL}/ouaa/captcha/check`;
    const res = await this.gateway.create<ReqGet>({ url, payload });
    return res;
  }

  // 获取验证码
  public async getsmsCode(payload?: { captchaVerification: string; tel: string; sendSmsCodeType?: string }): Promise<ReqGet> {
    const url = `${baseURL}/ouaa/sms/code/send`;
    const res = await this.gateway.create<ReqGet>({ url, payload });
    return res;
  }

  // 手机号绑定
  public async bindPhone(payload?: { tel: string; code?: string }): Promise<boolean> {
    const url = `${baseURL}/ouaa/user/phone/bind`;
    const res = await this.gateway.update<boolean>({ url, payload });
    return res;
  }
  // 手机号解绑
  public async unbindPhone(payload?: { tel: string; code?: string }): Promise<boolean> {
    const url = `${baseURL}/ouaa/user/phone/unbind`;
    const res = await this.gateway.update<boolean>({ url, payload });
    return res;
  }
}
