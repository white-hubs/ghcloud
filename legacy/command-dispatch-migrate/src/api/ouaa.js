import request from "@/utils/request";
import { method } from "lodash-es";
let baseURL = "/api/ouaa";
// if (process.env.NODE_ENV === "lzy" || process.env.NODE_ENV === "lrj") {
//   baseURL = "http://192.168.2.89:3100/parking";
// }
// 登录
export const Login = params =>
  request({
    url: "/gw-bff/auth/token",
    method: "post",
    params,
  });
export const getCurrentUser = params =>
  request({
    url: baseURL + "/user/mine",
    method: "get",
    params,
  })

// 刷新token
export const refreshToken = params =>
  request({
    url: "/gw-bff/auth/token",
    method: "post",
    params,
  });

// 获取文件
export const getFile = (params, method = "get") =>
  request({
    url: baseURL + `/file/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 用户管理接口

// // 用户管理接口 - 修改用户, 获取用户信息
// export const userId = (params,method = "post") =>
//   request({
//     url: baseURL + "/user/" + params.id,
//     method: method,
//     params,
//   });

// 用户管理接口 - 修改用户
export const userId = (params, method = "post") =>
  request({
    url: baseURL + "/user-under-tenant/" + params.id,
    method: method,
    params,
  });
export const getUser = (params, method = "get") =>
  request({
    url: baseURL + "/user-under-tenant/" + params.id,
    method: method,
    params,
  })
// 用户管理接口 -  获取用户信息
export const userInfo = (params, method = "post") =>
  request({
    url: baseURL + "/context/user",
    method: method,
    params,
  });

// 用户管理接口 - 新增用户
export const user = (params, method = "post") =>
  request({
    url: baseURL + "/authenticated/user",
    method: method,
    params,
  });

// 用户管理接口 - 查询用户
export const users = (params, method = "post") =>
  request({
    url: baseURL + "/users",
    method: method,
    params,
  });
// 用户管理接口 - 查询用户
export const getUsers = (params, method = "get") =>
  request({
    url: baseURL + "/users",
    method: method,
    params,
  });
// 用户管理接口 - 获取用户应用列表
export const userApp = (params, method = "post") =>
  request({
    url: baseURL + "/user/applications",
    method: method,
    params,
  });
// 用户管理接口 - 获取用户指定应用的菜单列表
export const userAppMenu = (params, method = "post") =>
  request({
    url: baseURL + "/user/application/" + params.id + "/menus",
    method: method,
    params,
  });
// 用户管理接口 - 获取用户菜单列表
export const userMenu = (params, method = "post") =>
  request({
    url: baseURL + "/user/menus",
    method: method,
    params,
  });

// 用户管理接口 - 重置用户密码
export const userPassword = (params, method = "post") =>
  request({
    url: baseURL + "/user/" + params.id + "/password",
    method: method,
    params,
  });

// // 我的企业 - 查询
export const getTenantInfo = (params, method = "get") =>
  request({
    url: baseURL + `/tenant-under-tenant/${params.id}`,
    method: method,
    params,
  });

// 用户管理接口 - 修改用户密码
export const modifyPassword = (params, method = "put") =>
  request({
    url: baseURL + "/user/" + params.id + "/new-password",
    method: method,
    params,
  });

// 设置主企业
// 设置主企业 - 设置主企业
export const setEnterprise = (params, method = "put") =>
  request({
    url: baseURL + "/tenant/" + params.tenant + "/main-enterprise",
    method: method,
    params,
  });

// 获取部门
export const getOrganizations = (params, method = "get") =>
  request({
    url: baseURL + "/authenticated/organizations",
    method: method,
  });
  // 获取岗位
export const getPositionList = (params, method = "get") =>
  request({
    url: baseURL + "/appointment/list",
    method: method,
  });  // 获取岗位
export const getRole = (params, method = "get") =>
  request({
    url: baseURL + "/authenticated/role/list-by-product",
    method: method,
  });
// 部门树
export const getOuaaOrganizations = (params, method = "get") =>
  request({
    url: baseURL + "/organizations",
    method: method,
    params: {
      enabled: true
    },
  });
// // 获取用户产品下面的应用列表
// export const getUserApplications = (params,method = "get") =>
//   request({
//     url: baseURL + `/user/product/${params.productCode}/applications`,
//     method: method,
//     params,
//   });

// 获取登录用户在访问端下的角色授权应用--new
export const getUserApplications = (params, method = "get") =>
  request({
    url: baseURL + `/context/terminal-applications`,
    method: method,
    params,
  });

// 获取当前用户的应用分组
export const getUserApplicationsGroups = (params, method = "get") =>
  request({
    url: baseURL + `/context/terminal-application-groups`,
    method: method,
    params,
  });

// // 获取用户指定应用的菜单列表--待删除
// export const getApplicationInMenus = (params,method = "get") =>
//   request({
//     url: baseURL + `/user/application/${params.applicationId}/menus`,
//     method: method,
//     params,
//   });

// 获取登录用户在访问端应用下的角色授权菜单--new
export const getApplicationInMenus = (params, method = "get") =>
  request({
    url: baseURL + `/context/terminal-application-menus`,
    method: method,
    params,
  });

// 获取菜单路径查询
export const getMenuPath = (params, method = "get") =>
  request({
    url: baseURL + `/menu/path/${params}`,
    method: method,
  });

// 部门
export const deptList = (params, method) =>
  request({
    url: baseURL + `/authenticated/organizations/list`,
    method: method,
    params,
  });

// 岗位
export const position = (params, method) =>
  request({
    url: baseURL + `/authenticated/positions`,
    method: method,
    params,
  });

// 角色
export const getRoleList = (params, method = "get") =>
  request({
    url: baseURL + `/authenticated/product/role/page`,
    method: method,
    params,
  });

// 用户管理接口 - 查询企业员工
export const tenantUsers = (params, method = "post") =>
  request({
    url: baseURL + "/authenticated/user-under-tenant/page",
    method: method,
    params,
  });

// 极光配置

// 新增
export const messageAdd = (params, method = "post") =>
  request({
    url: baseURL + "/msg-jg-config",
    method: method,
    params,
  });

// 修改,详情,删除
export const messageId = (params, method = "post") =>
  request({
    url: baseURL + "/msg-jg-config/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 部门列表
export const getAuthenticatedOrganizations = (params, method) =>
  request({
    url: baseURL + `/authenticated/organizations`,
    method: "get",
  });

// 岗位列表
export const getAuthenticatedPositions = (params, method) =>
  request({
    url: baseURL + `/authenticated/positions`,
    method: "get",
  });

// 用户列表
export const getAuthenticatedUserPage = (params, method) =>
  request({
    url: baseURL + `/authenticated/user/page`,
    method: "get",
    params,
  });

// 获取当前产品的访问端列表
export const getContextTerminals = (params, method) =>
  request({
    url: baseURL + `/context-terminals`,
    method: "get",
  });

// 根据路径判断是否有权限
export const getRoleMenusByPath = (params, method) =>
  request({
    url: baseURL + `/role-menus-by-path`,
    method: "get",
    params,
  });

// 获取登录用户在访问端下可配置的卡片列表
export const getContextTerminalCards = (params, method) =>
  request({
    url: baseURL + `/context/terminal-cards`,
    method: "get",
    params,
  });

// 获取登录用户在访问端下的首页卡片
export const getContextTerminalHomeCards = (params, method) =>
  request({
    url: baseURL + `/context/terminal-home-cards`,
    method: "get",
    params,
  });

// 首页应用卡片删除
export const deleteHomeApplicationCard = (params, method) =>
  request({
    url: baseURL + `/home-application-card/${params.id ? params.id : params}`,
    method: "delete",
    params,
  });

// 首页应用卡片批量保存
export const postHomeApplicationCard = (params, method) =>
  request({
    url: baseURL + `/home-application-card/batch`,
    method: "post",
    params,
  });

// 获取应用详情
export const getContextApplication = (params, method) =>
  request({
    url: baseURL + `/context/application/${params}`,
    method: "get",
    params,
  });

// 获取可选择
export const getAuthenticated = (params, method) =>
  request({
    url: baseURL + `/authenticated/user-under-tenant/page`,
    method: "get",
    params: params ? params : { pageSize: 1000, pageNumber: 1 },
  });

// 获取当前用户得历史应用列表
export const getTerminalHistory = (params, method) =>
  request({
    url: baseURL + `/context/terminal-history-applications`,
    method: "get",
    params,
  });
// 获取图形base64验证码
export const getLoginCode = (params, method) =>
  request({
    url: baseURL + `/public/auth/login/code/generate`,
    method: "get",
    params,
  });
