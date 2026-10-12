import request from '@/utils/request'
let baseURL = '/api/mdata'
// if (process.env.NODE_ENV === "loc") {
// 	baseURL = "http://192.168.2.89:3200/mdata";
// }

// 我的企业 - 查询
export const getTenant = (params, method = 'get') =>
	request({
		url: baseURL + '/tenant/mine',
		method: method,
		params
	})


// 区域管理接口 - 区域列表(区域管理)
export const getAreaList = (params, method) =>
	request({
		url: baseURL + "/area/list",
		method: 'get',
		params,
	});


// 档位 - 档位列表(档位管理)
export const getBoothList = (params, method) =>
	request({
		url: baseURL + "/stall/list",
		method: 'get',
		params,
	});


// 档位分类列表
export const getBoothTypeList = (params, method = "get") =>
	request({
		url: baseURL + "/stall-category/list",
		method: method,
		params,
	});

// 面板配置查询
export const panelConfig = (params, method = "get") =>
	request({
		url: baseURL + `/business-panel-configs/${params?.businessId ? params?.businessId : params}`,
		method: method,
		params,
	});

// 面板配置新增
export const panelConfigAdd = (data, method = "get") =>
	request({
		url: baseURL + `/business-panel-config`,
		method: method,
		data,
	});

