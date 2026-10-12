import request from "@/utils/request";

let baseURL = "/api/ouaa";
if (process.env.NODE_ENV === "lzy") {
  // baseURL = 'http://192.168.2.89:3100/ouaa'
  // baseURL = 'http://192.168.2.184:3100/ouaa'
}
// 登录
export const Login = (params) =>
  request({
    url: baseURL + "/oauth2/token",
    method: "post",
    params,
  });

export const refreshToken = (params) =>
  request({
    url: baseURL + "/oauth2/token",
    method: "post",
    params,
  });

// 个人信息

// 获取个人信息

// 用户管理接口 - 修改用户
export const userId = (method = "post", params) =>
  request({
    url: baseURL + "/user-under-tenant/" + params.id,
    method: method,
    params,
  });

// 用户管理接口 -  获取用户信息
export const userInfo = (method = "post", params) =>
  request({
    url: baseURL + "/context/user",
    method: method,
    params,
  });

// 用户管理接口 - 新增用户
export const user = (method = "post", params) =>
  request({
    url: baseURL + "/user-under-tenant",
    method: method,
    params,
  });

// 我的企业 - 查询
export const tenant = (method = "get", params) =>
  request({
    url: baseURL + "/context/admin/tenants",
    // url: baseURL + "/context/tenants",
    method: method,
    params,
  });
// 我的企业 - 查询
export const tenantId = (method = "get", params) =>
  request({
    url: baseURL + "/tenant-under-tenant/" + params.code,
    method: method,
    params,
  });

// 企业资料 - 修改
export const tenantInfo = (method = "put", params) =>
  request({
    url: baseURL + "/tenant-under-tenant",
    method: method,
    params,
  });

// 产品管理接口 - 角色产品权限--获取,修改
export const userProductPermission = (method = "put", params) =>
  request({
    url: baseURL + "/role/" + params.productId + "/permission",
    method: method,
    params,
  });

// 产品管理接口 - 查询产品权限列表
export const products = (method = "get", params) =>
  request({
    url: baseURL + "/permission/products",
    method: method,
    params,
  });

// 组织机构管理接口 - 新增组织机构
export const organization = (method = "post", params) =>
  request({
    url: baseURL + "/organization",
    method: method,
    params,
  });

// 组织机构管理接口 - 查询组织机构
export const organizations = (method = "post", params) =>
  request({
    url: baseURL + "/organizations",
    method: method,
    params,
  });

// 组织机构管理接口 - 修改组织机构
export const organizationId = (method = "post", params) =>
  request({
    url: baseURL + "/organization/" + params.id,
    method: method,
    params,
  });

// 删除组织机构
export const deleteOrganization = (method = "delete", id) =>
  request({
    url: baseURL + `/organization/${id}`,
    method: method,
  });

// 重置密码
export const resetPassword = (method = "put", data) =>
  request({
    url: baseURL + `/user/${data?.id ?? data}/password/reset`,
    method: method,
    data,
  });

// 职位管理接口 - 查询职位
export const positions = (method = "post", params) =>
  request({
    url: baseURL + "/positions",
    method: method,
    params,
  });

// 岗位管理接口 - 查询岗位
export const getAppointment = (method = "post", params) =>
  request({
    url: baseURL + "/appointment/page",
    method: method,
    params,
  });

// 职位管理接口 - 修改职位
export const appointmentId = (method = "post", params) =>
  request({
    url: baseURL + "/appointment",
    method: method,
    params,
  });

// 删除岗位
export const deleteAppointment = (method = "delete", id) =>
  request({
    url: baseURL + `/appointment/${id}`,
    method: method,
  });

// 职位管理接口 - 修改职位
export const positionId = (method = "post", params) =>
  request({
    url: baseURL + "/position/" + params.id,
    method: method,
    params,
  });

// 职位管理接口 - 新增职位
export const position = (method = "post", params) =>
  request({
    url: baseURL + "/position",
    method: method,
    params,
  });

// 角色管理接口 - 查询角色
export const roles = (method = "post", params) =>
  request({
    url: baseURL + "/roles",
    method: method,
    params,
  });

// 角色管理接口 - 修改角色
export const roleId = (method = "post", params) =>
  request({
    url: baseURL + "/role/" + params.id,
    method: method,
    params,
  });

// 角色管理接口 - 修改角色
export const role = (method = "post", params) =>
  request({
    url: baseURL + "/role",
    method: method,
    params,
  });

// 用户管理接口 - 查询企业员工
export const tenantUsers = (method = "post", params) =>
  request({
    url: baseURL + "/user-under-tenant/page",
    method: method,
    params,
  });

// 应用接口 - 获取应用权限列表
export const roleData = (method = "post", params) =>
  request({
    url:
      baseURL +
      "/role/" +
      params.productId +
      "/" +
      params.roleId +
      "/permissions",
    method: method,
    params,
  });

// 获取当前产品下的访问端
export const productTerminal = (method = "post", params) =>
  request({
    url:
      baseURL +
      "/terminal-under-tenant/page?" +
      "enabled=true",
    method: method,
    params,
  });

// 产品下的应用
export const productApp = (method = "get", params) =>
  request({
    url:
      baseURL +
      "/product/" +
      (params.id ? params.id : params) +
      "/applications",
    method: method,
    params,
  });

// 访问端已关联应用
export const terminalCheckedApp = (method = "get", params) =>
  request({
    url:
      baseURL +
      "/terminal-under-tenant/" +
      (params.id ? params.id : params) +
      "/applications",
    method: method,
    params,
  });

// 角色的访问端
export const getRoleTerminal = (method = "get", params) =>
  request({
    url: baseURL + "/role/" + (params.id ? params.id : params) + "/terminals",
    method: method,
    params,
  });

// 角色的访问端操作
export const roleTerminal = (method = "get", params) =>
  request({
    url:
      baseURL +
      "/role/" +
      params.id +
      "/terminal-mapping?terminalId=" +
      params.terminalId,
    method: method,
    params,
  });

// 角色的访问端已关联的应用
export const roleTerminalCheckedApp = (method = "get", params) =>
  request({
    url:
      baseURL +
      "/role/" +
      params.id +
      "/terminal-applications?terminalId=" +
      params.terminalId,
    method: method,
    params,
  });

// 角色的访问端关联应用
export const roleTerminalApp = (method = "get", params) =>
  request({
    url:
      baseURL +
      "/role/" +
      params.id +
      "/terminal-application-mapping?terminalId=" +
      params.terminalId +
      "&applicationId=" +
      params.applicationId,
    method: method,
    params,
  });

// 菜单列表
export const getMenu = (method = "get", params) =>
  request({
    url: baseURL + "/menu-under-tenant",
    method: method,
    params,
  });

// 当前访问端下当前应用下已选菜单列表
export const appCheckedMenu = (method = "get", params) =>
  request({
    url:
      baseURL +
      "/role/" +
      params.id +
      "/terminal-application-menus?terminalId=" +
      params.terminalId +
      "&applicationId=" +
      params.applicationId,
    method: method,
    params,
  });

// 当前访问端下当前应用下关联菜单列表
export const roleAppMenu = (method = "get", params) =>
  request({
    url:
      baseURL +
      "/role/" +
      params.id +
      "/terminal-application-menu-mapping?terminalId=" +
      params.terminalId +
      "&applicationId=" +
      params.applicationId +
      "&menuId=" +
      params.menuId,
    method: method,
    params,
  });
// 
// 添加菜单功能权限
export const updateMenuFunctionRole = (method = "post", params) => {
  request({
    url: `${baseURL}/role/${params.id}/terminal-application-menu-function-mapping?terminalId=${params.terminalId}&applicationId=${params.applicationId}&menuId=${params.menuId}&functionId=${params.functionId}`,
    method: method,
    params
  });
}
// 设置菜单数据权限 
export const updateMenuDataRole = (method = "post", params) => {
  request({
    url: `${baseURL}/role/${params.id}/terminal-application-menu-data-permission-mapping?terminalId=${params.terminalId}&applicationId=${params.applicationId}&menuId=${params.menuId}&permissionCode=${params.permissionCode}&businessKeys=${params.businessKeys ?? ""}`,
    method: method,
    params
  });
}
// 当前访问端下当前应用下关联菜单全选
export const roleAppMenuSelectAll = (method = "get", params) =>
  request({
    url:
      baseURL +
      "/role/" +
      params.id +
      "/all-terminal-application-menu-mappings?terminalId=" +
      params.terminalId +
      "&applicationId=" +
      params.applicationId,
    method: method,
    params,
  });

// 租户租用应用
export const tenantCodeProduct = (method = "get", params) =>
  request({
    url: baseURL + "/tenant-under-tenant/" + params.code + "/products",
    method: method,
    params,
  });

// 菜单功能
export const menuFunc = (method = "get", params) =>
  request({
    url: baseURL + `/function-under-tenant/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 新增角色菜单功能
export const menuFuncAdd = (method = "get", params) =>
  request({
    url:
      baseURL +
      `/role/${params.id ? params.id : params}/menu-function-mapping?menuId=${params.menuId
      }&functionId=${params.functionId}`,
    method: method,
    params,
  });

// 角色菜单功能
export const roleMenuFunc = (method = "get", params) =>
  request({
    url: baseURL + `/role/${params.id ? params.id : params}/menu-functions`,
    method: method,
    params,
  });

// 删除企业下的用户
export const deletePerson = (method = "delete", params) =>
  request({
    url: baseURL + `/user-under-tenant/${params?.id ?? params}`,
    method: method,
  });
// 获取图形base64验证码
export const getLoginCode = (params, method) =>
  request({
    url: baseURL + `/public/auth/login/code/generate`,
    method: "get",
    params,
  });
/**获取员工 */
export const tenantUserList = (params, method = "get") => {
  if (window.config.feature?.usePersonal) {
    return request({
      url: "/api/personnel" + "/staff/state/page",
      method: method,
      params: { ...params, enabled: true }
    });
  } else {
    return request({
      url: "/api/ouaa" + "/authenticated/user-under-tenant/page",
      method: method,
      params: {
        ...params,
        enabled: true,
      },
    });
  }
}
/**获取部门 */
export const organizationsList = (params, method = "get") => {
    return request({
      url: baseURL + "/authenticated/organizations/list",
      method: method,
      params: {
        ...params,
        enabled: true,
      },
    });
}


// 查询访问端列表
export const terminalConfigList = (method = "post", params) =>
  request({
    url: baseURL + `/terminal-config/list`,
    method: method,
    params,
  });
// 修改访问端配置
export const updateTerminalConfig = (method = "put", params) =>
  request({
    url: baseURL + `/terminal/config/${params.id}`,
    method: method,
    params,
  });
// 新增访问端配置
export const addTerminalConfig = (method = "post", params) =>
  request({
    url: baseURL + `/terminal/config`,
    method: method,
    params,
  });
// 角色批量分配用户
export const roleAssignUsers = (params,id) =>
  request({
    url: baseURL + `/role/${id}/assign/users`,
    method: "put",
    params,
  });
  // 获取角色下的用户id集合
export const roleUseridList = (id) =>
  request({
    url: baseURL + `/role/${id}/userid/list`,
    method: "get",
  });
export * from './file'
// 获取角色下的用户id集合
export const userCenterPage = (params) =>
  request({
    url:  `/api/personnel/user-center/page`,
    method: "get",
    params
  });
// 获取类型列表
export const staffTypeList = (params) =>
  request({
    url:  `/api/personnel/staff-type/list`,
    method: "get",
    params
  });