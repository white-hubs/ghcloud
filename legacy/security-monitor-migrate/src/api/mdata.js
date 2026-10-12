import request from '@/utils/request'
let baseURL = '/api/mdata'

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
// 获取摄像机session
export const getVideoPtzSession = (params, method = "get") =>
	request({
	  url: baseURL + "/video-ptz/login-session",
	  method: method,
	  params,
	});

// 流媒体服务器配置分页列表
export const getStreamMediaConfig = (params) =>
	request({
		url: baseURL + "/stream-media-configs",
		method: 'get',
		params,
	});