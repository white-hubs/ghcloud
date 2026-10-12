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
		url: baseURL + "/stall/page",
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
// 档位类型列表
export const getBoothTypePage = (params, method = "get") =>
	request({
		url: baseURL + "/stall-category/page",
		method: method,
		params,
	});

// 风险源类型
export const getCascadeDictionaryItem = (params, method) =>
  request({
    url: `/api/dictionary/getCascadeDictionaryItem`,
    method: 'get',
    params,
  })
// 获取小散工程类型列表
export const projectTypeList = (params, method) =>
  request({
    url: `/api/loose-works/project-type/list`,
    method: 'get',
    params,
  })
