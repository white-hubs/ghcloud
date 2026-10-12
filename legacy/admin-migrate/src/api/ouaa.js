import request from "@/utils/request";
let baseURL = "/api/ouaa";
if (process.env.NODE_ENV === "lzy") {
  // baseURL = "http://192.168.2.184:3100/ouaa";
  // baseURL = "http://192.168.2.89:3100/ouaa";
  // baseURL = "http://192.168.2.118:3100/ouaa";
}

export const addversion = ( data) =>

  request({
    url: baseURL + `/app-version`,
    method: 'post',
    data
  });
export const deleteversion = ( id) =>

  request({
    url: baseURL + `/app-version/${id}`,
    method: 'delete',

  });
export const versionlist = (method, params) =>

  request({
    url: baseURL + "/app-versions",
    method: method,
    params,
  });
// 登录
export const Login = (params) =>
  request({
    url: "/gw-bff/auth/token",
    method: "post",
    params,
    headers: {
      "x-oauth-client": "inner_terminal",
    },
  });

// 用户管理接口

// 用户管理接口 - 修改用户
export const userId = (method = "post", params) =>
  request({
    url: baseURL + "/user/" + params.id,
    method: method,
    params,
  });

// 用户管理接口 - 获取用户信息
export const userInfo = (method = "post", params) =>
  request({
    url: baseURL + "/context/user",
    method: method,
    params,
  });

// 用户管理接口 - 新增用户
export const user = (method = "post", params) =>
  request({
    url: baseURL + "/user",
    method: method,
    params,
  });

// 用户管理接口 - 查询用户
export const users = (method = "post", params) =>
  request({
    url: baseURL + "/users",
    method: method,
    params,
  });

// 获取登录用户在访问端下的角色授权应用
export const getUserApplications = (method = "get", params) =>
  request({
    url: baseURL + `/context/terminal-applications`,
    method: method,
    params,
  });

// 用户管理接口 - 获取用户指定应用的菜单列表
export const userAppMenu = (method = "post", params) =>
  request({
    url: baseURL + "/user/application/" + params.id + "/menus",
    method: method,
    params,
  });
// 用户管理接口 - 获取用户菜单列表
export const userMenu = (method = "post", params) =>
  request({
    url: baseURL + "/user/menus",
    method: method,
    params,
  });
// 用户管理接口 - 重置用户密码
export const userPassword = (method = "post", params) =>
  request({
    url: baseURL + "/user/" + params.id + "/password",
    method: method,
    params,
  });
// 用户列表 - 用户列表
export const getUserList = (method = "get", params) =>
  request({
    url: baseURL + "/users",
    method: method,
    params,
  });

// 用户列表 - 用户新增、
export const userOperate = (method = "post", params) =>
  request({
    url: baseURL + "/user",
    method: method,
    params,
  });

// 企业列表

// 企业列表 - 获取
export const getTenants = (method = "get", params) =>
  request({
    url: baseURL + "/tenant/page",
    method: method,
    params,
  });

// 企业列表 - 新增
export const tenantPost = (method = "get", params) =>
  request({
    url: baseURL + "/tenant",
    method: method,
    params,
  });

// 企业列表 - 编辑
export const tenants = (method = "get", params) =>
  request({
    url: baseURL + "/tenant/" + params.id,
    method: method,
    params,
  });

// 管理员列表
export const managerList = (method = "get", params) =>
  request({
    url: baseURL + "/users",
    method: method,
    params,
  });

// 应用列表
export const appList = (method = "get", params) =>
  request({
    url: baseURL + "/applications",
    method: method,
    params,
  });

// 应用分组列表
export const appGroup = (method = "get", params) =>
  request({
    url: baseURL + "/application-groups",
    method: method,
    params,
  });

// 应用分组列表
export const appGroupAdd = (method = "get", params) =>
  request({
    url: baseURL + "/application-group",
    method: method,
    params,
  });

// 应用分组列表
export const appGroupId = (method = "get", params) =>
  request({
    url: baseURL + `/application-group/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 租户租用应用
export const tenantCodeProduct = (method = "get", params) =>
  request({
    url: baseURL + "/tenant/" + params.code + "/products",
    method: method,
    params,
  });

// 租户详情
export const tenantCode = (method = "get", params) =>
  request({
    url: baseURL + `/tenant/${params.code ? params.code : params}`,
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

// 给产品分配应用
export const productSetApp = (method = "get", params) =>
  request({
    url:
      baseURL +
      "/product/" +
      (params.id ? params.id : params) +
      "/application-mapping?applicationId=" +
      params.applicationId,
    method: method,
    params,
  });

// 应用详情,修改
export const appId = (method = "get", params) =>
  request({
    url: baseURL + "/application/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 产品列表
export const productList = (method = "get", params) =>
  request({
    url: baseURL + "/products",
    method: method,
    params,
  });

// 产品新增
export const addProduct = (method = "get", params) =>
  request({
    url: baseURL + "/product",
    method: method,
    params,
  });

// 产品详情,修改
export const productId = (method = "get", params) =>
  request({
    url: baseURL + "/product/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 应用操作

// 获取访问端
export const getTerminals = (method = "get", params) =>
  request({
    url: baseURL + "/terminals",
    method: method,
    params,
  });

// 获取产品下访问端
export const getproductTerminals = (method = "get", params) =>
  request({
    url: baseURL + "/terminals?productId=" + params.productId + "&enabled=true",
    method: method,
    params,
  });

// 删除产品下访问端
export const delProductTerminals = (method = "get", params) =>
  request({
    url: baseURL + "/terminal/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 访问端关联应用
export const terminalApp = (method = "get", params) =>
  request({
    url:
      baseURL +
      "/terminal/" +
      params.id +
      "/application-mapping?applicationId=" +
      params.appId,
    method: method,
    params,
  });

// 访问端已关联应用
export const terminalCheckedApp = (method = "get", params) =>
  request({
    url:
      baseURL +
      "/terminal/" +
      (params.id ? params.id : params) +
      "/applications",
    method: method,
    params,
  });

// 添加应用
export const addApp = (method = "get", params) =>
  request({
    url: baseURL + "/application",
    method: method,
    params,
  });

// 菜单操作

// 菜单列表
export const getMenu = (method = "get", params) =>
  request({
    url: baseURL + "/menus",
    method: method,
    params,
  });

// 添加菜单
export const addAppMenu = (method = "get", params) =>
  request({
    url: baseURL + "/menu",
    method: method,
    params,
  });

// 获取菜单详情,修改菜单
export const menuId = (method = "get", params) =>
  request({
    url: baseURL + "/menu/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 访问端

// 访问端添加
export const addTerminal = (method = "get", params) =>
  request({
    url: baseURL + "/terminal",
    method: method,
    params,
  });

// 访问端删除,修改
export const terminalId = (method = "delete", params) =>
  request({
    url: baseURL + "/terminal/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 产品线

// 产品线列表
export const productLine = (method = "delete", params) =>
  request({
    url: baseURL + "/product-lines",
    method: method,
    params,
  });

// 产品线新增
export const addProductLine = (method = "delete", params) =>
  request({
    url: baseURL + "/product-line",
    method: method,
    params,
  });

// 产品线修改
export const productLineId = (method = "delete", params) =>
  request({
    url: baseURL + "/product-line/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 租户产品分配
export const tenantProduct = (method = "delete", params) =>
  request({
    url:
      baseURL +
      "/tenant/" +
      params.code +
      "/product-mapping?productId=" +
      params.id,
    method: method,
    params,
  });

// 租户应用分配
export const tenantProductApp = (method = "delete", params) =>
  request({
    url:
      baseURL +
      "/tenant/" +
      (params.code ? params.code : params) +
      "/product-application-mapping?applicationId=" +
      params.applicationId,
    method: method,
    params,
  });

// 当前租户下的应用
export const getPenantProductApp = (method = "delete", params) =>
  request({
    url:
      baseURL +
      "/tenant/" +
      (params.code ? params.code : params) +
      "/product-applications",
    method: method,
    params,
  });

// 当前用户的租户
export const UserTenant = (method = "delete", params) =>
  request({
    url: baseURL + "/context/tenants",
    method: method,
    params,
  });

// 当前应用下的菜单
export const appMenu = (method = "delete", params) =>
  request({
    url:
      baseURL +
      // `/context/terminal-application-menus?applicationId=${params.id ? params.id : params
      `/context/terminal-application-menus?applicationCode=${params.id ? params.id : params
      }`,
    method: method,
    params,
  });

// 当前菜单的功能
export const menuFunc = (method = "delete", params) =>
  request({
    url: baseURL + `/functions/menu/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 新增菜单的功能
export const addMenuFunc = (method = "delete", params) =>
  request({
    url: baseURL + `/function`,
    method: method,
    params,
  });

// 修改菜单的功能
export const menuFuncId = (method = "delete", params) =>
  request({
    url: baseURL + `/function/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 卡片列表
export const cardList = (method = "get", params) =>
  request({
    url: baseURL + `/cards`,
    method: method,
    params,
  });

// 卡片新增
export const cardAdd = (method = "post", params) =>
  request({
    url: baseURL + `/card`,
    method: method,
    params,
  });

// 卡片修改,删除
export const cardId = (method = "put", params) =>
  request({
    url: baseURL + `/card/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 密码安全配置
export const passwordSetting = (method = "post", data) =>
  request({
    url: baseURL + `/password/setting`,
    method: method,
    data,
  });

// 密码安全配置详情
export const passwordDetail = (method = "get", params) =>
  request({
    url: baseURL + `/password/detail`,
    method: method,
    params,
  });

// 卡片解绑
export const cardIdUnbind = (method = "put", params) =>
  request({
    url: baseURL + `/card/${params.terminalId}/${params.applicationId}/${params.code}`,
    method: method,
    params,
  });

// 访客统计
export const visitorStatistics = (method = "get", params) =>
  request({
    url: baseURL + `/public/experience/listByPage`,
    method: method,
    params,
  });

// 应用路径配置
export const appPath = (method = "get", params) =>
  request({
    url: baseURL + `/terminal/${params.terminalId ? params.terminalId : params}/application-path-mapping`,
    method: method,
    params,
  });

// 查询应用路径配置
export const checkPath = (method = "get", params) =>
  request({
    url: baseURL + `/terminal/${params.id ? params.id : params}/application-path-mapping?applicationId=${params.applicationId ? params.applicationId : params}`,
    method: method,
    params,
  });

// 获取图形base64验证码
export const getLoginCode = (params, method) =>
  request({
    url: baseURL + `/public/auth/login/code/generate`,
    method: "get",
    params,
  });
export const refreshToken = params =>
  request({
    url: "/gw-bff/auth/token",
    method: "post",
    params,
    headers: {
      "x-oauth-client": "inner_terminal",
    },
  });
  