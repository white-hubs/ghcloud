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

  // 档位接口

  // 档位接口 - 档位删除, 档位ID查询
  export const boothId = (params, method = "delete") =>
    request({
      url: baseURL + "/stall/" + params.id,
      method: method,
      params,
    });
  
  // 档位接口 - 档位新增,档位更新
  export const booth = (params, method = "post") =>
    request({
      url: baseURL + "/stall",
      method: method,
      params,
    });
  
  // 档位接口 - 档位分页查询
  export const getBooth = (params, method = "get") =>
    request({
      url: baseURL + "/stall/page",
      method: method,
      params,
    });
  
  // 档位接口 - 档位分页查询
  export const getMerchantBooth = (params, method = "get") =>
    request({
      url:
        baseURL +
        `/stall/${params.merchantId ? params.merchantId : params}/supplier`,
      method: method,
      params,
    });
  
  // 档位接口 - 档位分页查询含收费项目
  export const getLeasePage = (params, method = "get") =>
    request({
      url: baseURL + "/stall/lease/page",
      method: method,
      params,
    });
  
  // 档位分类接口 - 档位类型ID删除, 档位分类ID查询
  export const boothTypeId = (params, method = "delete") =>
    request({
      url: baseURL + "/stall-category/" + params.id,
      method: method,
      params,
    });
  
  // 档位分类接口 - 档位分类分页查询
  export const getBoothType = (params, method = "get") =>
    request({
      url: baseURL + "/stall-category/page",
      method: method,
      params,
    });
  // 档位分类接口 - 档位分类列表查询
  export const getBoothTypeList = (params, method = "get") =>
    request({
      url: baseURL + "/stall-category/list",
      method: method,
      params,
    });
  
  // 档位分类接口 - 档位分类新增, 档位分类更新
  export const boothType = (params, method = "post") =>
    request({
      url: baseURL + "/stall-category",
      method: method,
      params,
    });
  
  // 商户基本信息接口
  
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
  
  // 商户认证接口
  
  // 商户认证接口 - ID查询
  export const authenticationId = (params, method = "get") =>
    request({
      url: baseURL + "/authentication/" + params.id,
      method: method,
      params,
    });
  
  // 商户认证接口 - 分页查询, 商户认证新增--new
  export const getAuthentication = (params, method = "get") =>
    request({
      url: baseURL + "/supplier/page",
      method: method,
      params,
    });
  
  // // 商户认证接口 - 分页查询, 商户认证新增
  // export const getAuthentication = (params, method = "get") =>
  //   request({
  //     url: baseURL + "/authentication",
  //     method: method,
  //     params,
  //   });
  
  // 商户认证接口 - 商户认证审核
  export const authenticationReview = (params, method = "get") =>
    request({
      url: baseURL + "/authentication/review",
      method: method,
      params,
    });
  
  // 区域管理接口
  
  // 区域管理接口 - 区域删除
  export const areaId = (params, method = "get") =>
    request({
      url: baseURL + "/area/" + params.id,
      method: method,
      params,
    });
  
  // 区域管理接口 - 区域列表(档位信息)
  export const getAreaListforBoothInfo = (params, method = "get") =>
    request({
      url: baseURL + "/area/stall/list",
      method: method,
      params,
    });
  
  
  // 区域管理接口 - 新增区域, 更新区域
  export const area = (params, method = "post") =>
    request({
      url: baseURL + "/area",
      method: method,
      params,
    });
  
  // 商品分类接口
  
  // 商品分类接口 - 商品品类删除
  export const goodsTypeId = (params, method = "delete") =>
    request({
      url: baseURL + "/goods-category/" + params.id,
      method: method,
      params,
    });
  // 商品分类接口 - 商品分类列表
  export const getGoodsTypeList = (params, method = "get") =>
    request({
      url: baseURL + "/goods-category/list",
      method: method,
      params,
    });
  // 商品分类接口 - 商品分类新增, 商品分类更新
  export const goodsType = (params, method = "get") =>
    request({
      url: baseURL + "/goods-category",
      method: method,
      params,
    });
  
  // 我的企业 - 查询
  export const tenant = (params, method = "get") =>
    request({
      url: baseURL + "/tenant/mine",
      method: method,
      params,
    });
  
  // 业务日志
  export const getBizLogRecord = (params, method = "get") =>
    request({
      url: baseURL + "/biz-log-record/page",
      method: method,
      params,
    });
  // 登录日志
  export const getLoginLogRecord = (params, method = "get") =>
    request({
      url: baseURL + "/biz-log-record/login/page",
      method: method,
      params,
    });
  
  // 业务操作类型
  export const getBizList = (params, method = "get") =>
    request({
      url: baseURL + "/biz-log-record/biz",
      method: method,
      params,
    });
  
  // 业务日志导出
  export const exportBizLog = (params, method = "post") =>
    request({
      url: baseURL + "/export/biz-log-record/biz",
      method: method,
      params,
      responseType: "blob"
    });
  
  // 登录日志导出
  export const exportLoginLog = (params, method = "post") =>
    request({
      url: baseURL + "/export/biz-log-record/login",
      method: method,
      params,
      responseType: "blob"
    });
  