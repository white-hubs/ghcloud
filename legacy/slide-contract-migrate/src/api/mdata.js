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


  // 商户基本信息接口 - 商户基本信息ID查询
  export const merchantId = (params, method = "get") =>
    request({
      url: baseURL + "/supplier/" + (params.id ? params.id : params),
      method: method,
      params,
    });
  
  // 商户基本信息接口 - 商户基本信息新增, 商户基本信息更新,分页查询
  export const merchant = (params, method = "get") =>
    request({
      url: baseURL + "/supplier/page",
      method: method,
      params,
    });
  
  // 商户基本信息接口 - 模糊查询获取商户主键集合
  export const getMerchantIds = (params, method = "get") =>
    request({
      url: baseURL + "/supplier/ids",
      method: method,
      params,
    });
  
