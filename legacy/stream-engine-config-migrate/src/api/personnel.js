import request from "@/utils/request";
let baseURL = "/api/personnel";

// 员工列表查询
export const getStaffList = (params, method) =>
  request({
    url: baseURL + `/staff/page`,
    method: "get",
    params:{...params,enabled:true},
  });

// // 员工分页查询
// export const getStaffPage = (params, method) =>
//   request({
//     url: baseURL + `/staff/page`,
//     method: "get",
//     params,
//   });

// 查询员工某个字段信息
export const getStaffInfo = (params, method) =>
  request({
    url: baseURL + `/staff/info`,
    method: "get",
    params,
  });

// 查询员工详情
export const getStaffDetail = (params, method) =>
  request({
    url: baseURL + `/staff/${params?.id ?? params}`,
    method: "get",
  });

// 角色列表查询
export const getRoles = (params, method) =>
	request({
		url: baseURL + `/authenticated/role/list-by-product`,
		method: 'get',
		params
	})
