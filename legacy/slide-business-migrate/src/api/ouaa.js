import request from '@/utils/request'
let baseURL = '/api/ouaa'

// 登录
export const Login = (data) =>
	request({
		url: '/gw-bff/auth/token',
		method: 'post',
		data
	})

// 刷新token
export const refreshToken = (params) =>
	request({
		url: '/gw-bff/auth/token',
		method: 'post',
		params
	})

// 获取文件
export const getFile = (params, method = 'get') =>
	request({
		url: baseURL + `/file/${params.id ? params.id : params}`,
		method: method,
		params
	})

// 用户管理接口

// // 用户管理接口 - 修改用户, 获取用户信息
// export const userId = (method = "post", params) =>
//   request({
//     url: baseURL + "/user/" + params.id,
//     method: method,
//     params,
//   });

// 用户管理接口 - 修改用户
export const userId = (method = 'post', params) =>
	request({
		url: baseURL + '/user-under-tenant/' + params.id,
		method: method,
		params
	})

// 用户管理接口 -  获取用户信息
export const userInfo = (method = 'get', params) =>
	request({
		url: baseURL + '/context/user',
		method: method,
		params
	})

// 用户管理接口 - 新增用户
export const user = (method = 'post', params) =>
	request({
		url: baseURL + '/authenticated/user',
		method: method,
		params
	})

// 用户管理接口 - 查询用户
export const users = (method = 'post', params) =>
	request({
		url: baseURL + '/users',
		method: method,
		params
	})
// 用户管理接口 - 查询用户
export const getUsers = (params, method = 'get') =>
	request({
		url: baseURL + '/users',
		method: method,
		params
	})
// 用户管理接口 - 获取用户应用列表
export const userApp = (method = 'post', params) =>
	request({
		url: baseURL + '/user/applications',
		method: method,
		params
	})
// 用户管理接口 - 获取用户指定应用的菜单列表
export const userAppMenu = (method = 'post', params) =>
	request({
		url: baseURL + '/user/application/' + params.id + '/menus',
		method: method,
		params
	})
// 用户管理接口 - 获取用户菜单列表
export const userMenu = (method = 'post', params) =>
	request({
		url: baseURL + '/user/menus',
		method: method,
		params
	})

// 用户管理接口 - 重置用户密码
export const userPassword = (method = 'post', params) =>
	request({
		url: baseURL + '/user/' + params.id + '/password',
		method: method,
		params
	})

// // 我的企业 - 查询
// export const tenant = (method = "get", params) =>
//   request({
//     url: baseURL + "/tenant/mine",
//     method: method,
//     params,
//   });

// 用户管理接口 - 修改用户密码
export const modifyPassword = (method = 'put', params) =>
	request({
		url: baseURL + '/user/' + params.id + '/new-password',
		method: method,
		params
	})

// 设置主企业
// 设置主企业 - 设置主企业
export const setEnterprise = (method = 'put', params) =>
	request({
		url: baseURL + '/tenant/' + params.tenant + '/main-enterprise',
		method: method,
		params
	})

// 获取部门
export const getOrganizations = (params, method = 'get') =>
	request({
		url: baseURL + '/authenticated/organizations',
		method: method
	})

// // 获取用户产品下面的应用列表
// export const getUserApplications = (method = "get", params) =>
//   request({
//     url: baseURL + `/user/product/${params.productCode}/applications`,
//     method: method,
//     params,
//   });

// 获取登录用户在访问端下的角色授权应用--new
export const getUserApplications = (params, method = 'get') =>
	request({
		url: baseURL + `/context/terminal-applications`,
		method: method,
		params
	})

// // 获取用户指定应用的菜单列表--待删除
// export const getApplicationInMenus = (method = "get", params) =>
//   request({
//     url: baseURL + `/user/application/${params.applicationId}/menus`,
//     method: method,
//     params,
//   });

// 获取登录用户在访问端应用下的角色授权菜单--new
export const getApplicationInMenus = (params, method = 'get') =>
	request({
		url: baseURL + `/context/terminal-application-menus?applicationId=${params.applicationId}`,
		method: method,
		params
	})

// 获取菜单路径查询
export const getMenuPath = (params, method = 'get') =>
	request({
		url: baseURL + `/menu/path/${params}`,
		method: method
	})

// 部门
export const deptList = (params, method,) =>
	request({
		url: baseURL + `/authenticated/organizations/list`,
		method: method,
		params
	})

// 岗位
export const position = (params, method) =>
	request({
		url: baseURL + `/authenticated/positions`,
		method: method,
		params
	})

// 角色
export const getRoleList = (method, params) =>
	request({
		url: baseURL + `/role/list`,
		method: method,
		params
	})

// 用户管理接口 - 查询企业员工
export const tenantUsers = (params, method = 'get') =>
	request({
		url: baseURL + '/authenticated/user-under-tenant/page',
		method: method,
		params
	})

// 极光配置

// 新增
export const messageAdd = (method = 'post', params) =>
	request({
		url: baseURL + '/msg-jg-config',
		method: method,
		params
	})

// 修改,详情,删除
export const messageId = (method = 'post', params) =>
	request({
		url: baseURL + '/msg-jg-config/' + (params.id ? params.id : params),
		method: method,
		params
	})

// 部门列表
export const getAuthenticatedOrganizations = (method, params) =>
	request({
		url: baseURL + `/authenticated/organizations`,
		method: 'get'
	})

// 岗位列表
export const getAuthenticatedPositions = (method, params) =>
	request({
		url: baseURL + `/authenticated/positions`,
		method: 'get'
	})

// 用户列表
export const getAuthenticatedUserPage = (method, params) =>
	request({
		url: baseURL + `/authenticated/user/page`,
		method: 'get'
	})
