import request from "@/utils/request";

const baseURL = "/api/ouaa";

// 登录
// Login
export const Login = params =>
  request({
    url: "/gw-bff/auth/token",
    method: "post",
    params,
  });
  export const LoginBind = (params) =>
  request({
    url:  baseURL+`/public/user/auth/bind-login`,
    method: "post",
    params
  });
export const getApplication = (appcode) => {
  return request({
    url: baseURL + `/context/application/${appcode}`,
    method: 'get'
  })
}
// 刷新token
// refreshToken
export const refreshToken = params =>
  request({
    url: "/gw-bff/auth/token",
    method: "post",
    params,
  });

// 用户管理接口 -  获取用户信息
// userInfo
export const userInfo = (params, method = "post") =>
  request({
    url: baseURL + "/context/user",
    method: method,
    params,
  });

// 获取当前用户的应用分组
// getUserApplicationsGroups
export const getUserApplicationsGroups = (params, method = "get") =>
  request({
    url: baseURL + `/context/terminal-application-groups`,
    method: method,
    params,
  });

// 获取登录用户在访问端应用下的角色授权菜单--new
// getApplicationInMenus
export const getApplicationInMenus = (params, method = "get") =>
  request({
    url: baseURL + `/context/terminal-application-menus`,
    method: method,
    params,
  });

// 获取图形base64验证码
// getLoginCode
export const getLoginCode = (params, method) =>
  request({
    url: baseURL + `/public/auth/login/code/generate`,
    method: "get",
    params,
  });
export const getUserPermissionList = () =>
  request({
    url: baseURL + `/user-permissions`,
    method: "get",
  });
export const getPermissionList = () =>
  request({
    url: baseURL + `/permissions`,
    method: "get",
  });
// 
export const getUserTerminals = (params, method) =>
  request({
    url: baseURL + `/context/user/terminals`,
    method: "get",
    params,
  });
export const getTenantInfo = (tenantCode) =>
  request({
    url: `/api/ouaa/tenant-under-tenant/${tenantCode}`,
    method: "get",
  });
  export const getsmsCode = (params) =>
  request({
    url: `/api/ouaa/sms/code/send`,
    method: "post",
    params
  });
  export const getPasswordToken = (params) =>
  request({
    url: `/api/ouaa/retrieve-password/token`,
    method: "get",
    params
  });  
  export const changePassword = (params) =>
  request({
    url: `/api/ouaa/retrieve-password/reset`,
    method: "put",
    params
  });