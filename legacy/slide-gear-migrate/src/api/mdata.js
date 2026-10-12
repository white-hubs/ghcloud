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
      url: baseURL + "/stall-category/" + params,
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
  
  // 风险级别
  
  // 风险级别查询、新增、编辑
  export const riskLevelData = (params, method = "get") =>
    request({
      url: baseURL + "/risk-level",
      method: method,
      params,
    });
  
  // 流程事件查询
  export const getflowEvent = (params, method = "get") =>
    request({
      url: baseURL + "/flow-event",
      method: "get",
      params,
    });
  
  // 区域下档位的租赁统计
  export const getAreaStatStallPage = (params, method = "get") =>
    request({
      url: baseURL + "/area-stat/stall/page",
      method: "get",
      params,
    });
  
  // 流程类型分页
  export const getFlowTypePage = (params, method = "get") =>
    request({
      url: baseURL + "/flow-type/page",
      method: "get",
      params,
    });
  
  // 流程类型
  export const getFlowTypeList = (params, method = "get") =>
    request({
      url: baseURL + "/flow-type/list",
      method: "get",
      params,
    });
  
  // 流程类型更新
  export const putFlowType = (params, method = "put") =>
    request({
      url: baseURL + `/flow-type/${params.id}`,
      method: "put",
      params,
    });
  
  // 流程类型删除
  export const deleteFlowType = (params, method = "delete") =>
    request({
      url: baseURL + `/flow-type/${params.id ? params.id : params}`,
      method: "delete",
    });
  
  // 流程类型新增
  export const postFlowType = (params, method = "post") =>
    request({
      url: baseURL + `/flow-type/`,
      method: "post",
      params,
    });
  
  // 流程配置分页
  export const getFlowPage = (params, method = "get") =>
    request({
      url: baseURL + "/flow/page",
      method: "get",
      params,
    });
  
  // 流程更新
  export const putFlow = (params, method = "put") =>
    request({
      url: baseURL + `/flow/${params.id}`,
      method: "put",
      params,
    });
  
  // 流程详情
  export const getFlow = (params, method = "get") =>
    request({
      url: baseURL + `/flow/${params.id ? params.id : params}`,
      method: "get",
    });
  
  // 流程新增
  export const postFlow = (params, method = "post") =>
    request({
      url: baseURL + `/flow/`,
      method: "post",
      params,
    });
  
  // 流程删除
  export const deleteFlow = (params, method = "delete") =>
    request({
      url: baseURL + `/flow/${params.id ? params.id : params}`,
      method: "delete",
    });
  
  // 设备管理
  
  // 设备类型
  export const equipTypeApp = (params, method = "delete") =>
    request({
      url: baseURL + `/mdata-device-type/page`,
      method: "get",
      params,
    });
  
  // 设备类型列表
  export const equipTypeAppList = (params, method = "delete") =>
    request({
      url: baseURL + `/mdata-device-type/list`,
      method: "get",
      params,
    });
  
  // 设备类型树
  export const equipTypeTree = (params, method = "delete") =>
    request({
      url: baseURL + `/mdata-device-type/tree`,
      method: "get",
      params,
    });
  
  // // 设备管理树形
  // export const equipTypeTree = (params, method = "delete") =>
  //   request({
  //     url: baseURL + `/mdata-device/device/trees`,
  //     method: "get",
  //     params,
  //   });
  
  // 设备管理可绑定数据
  export const equipTypeTreeBind = (params, method = "delete") =>
    request({
      url: baseURL + `/mdata-device/${params.id ? params.id : params}/bind/page`,
      method: method,
      params,
    });
  
  // 设备数据
  export const equipBind = (params, method) =>
    request({
      url:
        baseURL +
        `/mdata-device/${params.deviceId}/bind?deviceIds=${params.deviceIds}`,
      method: method,
      params,
    });
  
  // 设备标签统计
  export const equipTagStatis = (params, method) =>
    request({
      url: baseURL + `/device-stat/tag/summary`,
      method: method,
      params,
    });
  
  // 设备状态统计
  export const equipStatusStatis = (params, method) =>
    request({
      url: baseURL + `/device-stat/status/summary`,
      method: method,
      params,
    });
  
  // 设备列表
  export const equipTable = (params, method = "delete") =>
    request({
      url: baseURL + `/mdata-device/page`,
      method: method,
      params,
    });
  
  // 设备新增
  export const equipAdd = (params, method = "delete") =>
    request({
      url: baseURL + `/mdata-device`,
      method: method,
      params,
    });
  
  // 设备删除,详情,编辑
  export const equipId = (params, method = "delete") =>
    request({
      url: baseURL + `/mdata-device/${params.id ? params.id : params}`,
      method: method,
      params,
    });
  
  // 设备标签
  export const equipTagList = (params, method = "delete") =>
    request({
      url: baseURL + `/device-tag/list`,
      method: method,
      params,
    });
  
  // 设备标签
  export const BindEquipPage = (params, method = "delete") =>
    request({
      url:
        baseURL +
        `/mdata-device/${params.id ? params.id : params}/bind/page/detail`,
      method: method,
      params,
    });
  
  /* 批发商 */
  
  // 批发商分页
  export const wholeSalerPage = (params, method = "delete") =>
    request({
      url: baseURL + `/supplier/page`,
      method: method,
      params,
    });
  
  // 批发商新增
  export const wholeSalerAdd = (params, method = "delete") =>
    request({
      url: baseURL + `/supplier`,
      method: method,
      params,
    });
  
  // 批发商认证信息新增
  export const wholeSalerAuthinfoAdd = (params, method = "delete") =>
    request({
      url: baseURL + `/pc/supplier-authentication`,
      method: method,
      params,
    });
  // 采购商认证
  export const purchaseAuthinfoAdd = (params) =>
    request({
      url: baseURL + `/purchaser-authentication/${params.supplierId}`,
      method: "post",
      params,
    });
  // 批发商详情
  export const wholeSalerId = (params, method = "delete") =>
    request({
      url: baseURL + `/supplier/${params.id ? params.id : params}`,
      method: method,
      params,
    });
  
  /* 实名认证 */
  
  // 批发商实名认证分页
  export const realNamePage = (params, method = "delete") =>
    request({
      url: baseURL + `/supplier-authentication/page`,
      method: method,
      params,
    });
  // 采购商实名认证分页
  export const purchaserRealNamePage = (params, method = "get") =>
    request({
      url: baseURL + `/purchaser-authentication/verify/page`,
      method: method,
      params,
    });
  
  // 实名认证详情
  export const realNameDetail = (params, method = "delete") =>
    request({
      url: baseURL + `/supplier-authentication/${params.id ? params.id : params}`,
      method: method,
      params,
    });
  //采购商实名认证详情
  export const purchaserRealNameDetail = (params, method = "get") =>
    request({
      url: baseURL + `/purchaser-authentication/${params.id ? params.id : params}`,
      method: method,
      params,
    });
  // 采购商实名认证审核
  export const purchaserRealNameAudit = (params, method = "get") =>
    request({
      url: baseURL + `/purchaser-authentication/${params.id}/audit`,
      method: method,
      params,
    });
  // 实名认证审核
  export const realNameAudit = (params, method = "delete") =>
    request({
      url:
        baseURL +
        `/supplier-authentication/${
          params.id ? params.id : params
        }/audit?remark=${params.remark}&status=${params.status}`,
      method: method,
      params,
    });
  
  /* 物联配置 */
  
  // 获取租户下的第一个项目
  export const tenantFirstPro = (params, method = "delete") =>
    request({
      url: baseURL + `/device-iot/first/project`,
      method: method,
      params,
    });
  
  // 通过项目ID 获取品牌
  export const idIotBrand = (params, method = "delete") =>
    request({
      url: baseURL + `/device-iot/${params.id ? params.id : params}/brands`,
      method: method,
      params,
    });
  
  // 通过项目ID,品牌查询设备型号
  export const idIotModel = (params, method = "delete") =>
    request({
      url: baseURL + `/device-iot/${params.id ? params.id : params}/model`,
      method: method,
      params,
    });
  
  // 配置物联信息
  export const iotModelBind = (params, method = "delete") =>
    request({
      url: baseURL + `/mdata-device/iot/bind`,
      method: method,
      params,
    });
  
  // 当前物联配置信息
  export const iotModelBindInfo = (params, method = "delete") =>
    request({
      url: baseURL + `/mdata-device/${params.id ? params.id : params}/iot/bind`,
      method: method,
      params,
    });
  
  // 车道
  export const passWayTag = (params, method = "delete") =>
    request({
      url:
        baseURL + `/mdata-device/${params.tag ? params.tag : params}/area/tree`,
      method: method,
      params,
    });
  
  // 银行卡校验配置保存
  export const postBankCardValid = (params, method = "post") =>
    request({
      url: baseURL + `/bank-card-valid`,
      method: "post",
      params,
    });
  
  // 银行卡校验配置修改
  export const putBankCardValid = (params, method = "put") =>
    request({
      url: baseURL + `/bank-card-valid/${params.id ? params.id : params}`,
      method: "put",
      params,
    });
  
  // 银行卡校验配置详情
  export const getBankCardValid = (params, method = "get") =>
    request({
      url: baseURL + `/bank-card-valid`,
      method: "get",
      params,
    });
  
  // 微信支付配置保存
  export const postWeixinPayConfig = (params, method = "post") =>
    request({
      url: baseURL + `/weixin-pay-config`,
      method: "post",
      params,
    });
  
  // 微信支付配置修改
  export const putWeixinPayConfig = (params, method = "put") =>
    request({
      url: baseURL + `/weixin-pay-config/${params.id ? params.id : params}`,
      method: "put",
      params,
    });
  
  // 微信支付配置详情
  export const getWeixinPayConfig = (params, method = "get") =>
    request({
      url: baseURL + `/weixin-pay-config`,
      method: "get",
      params,
    });
  
  // 我的企业 - 查询
  export const tenant = (params, method = "get") =>
    request({
      url: baseURL + "/tenant/mine",
      method: method,
      params,
    });
  
  // 流媒体配置
  
  // 流媒体配置分页
  export const sMedia = (params, method = "get") =>
    request({
      url: baseURL + "/stream-media-configs",
      method: method,
      params,
    });
  
  // 流媒体配置新增
  export const sMediaAdd = (params, method = "get") =>
    request({
      url: baseURL + "/stream-media-config",
      method: method,
      params,
    });
  
  // 流媒体配置修改
  export const sMediaEdit = (params, method = "get") =>
    request({
      url: baseURL + "/stream-media-config/" + (params.id ? params.id : params),
      method: method,
      params,
    });
  
  // 设备流媒体配置详情
  export const equipSMediaDtl = (params, method = "get") =>
    request({
      url: baseURL + "/device-stream-media/" + (params.id ? params.id : params),
      method: method,
      params,
    });
  
  // 设备流媒体配置
  export const equipSMedia = (params, method = "get") =>
    request({
      url: baseURL + "/device-stream-media",
      method: method,
      params,
    });
  
  // 抽检员添加
  export const getInspectUserPage = (params, method) =>
    request({
      url: baseURL + `/inspector/user/page`,
      method: "get",
    });
  
  // 采购商分页查询
  export const getPurchaserAuthenticationPage = (params, method) =>
    request({
      url: baseURL + `/purchaser-authentication/page`,
      method: "get",
      params,
    });
  
  // 采购商获取认证状态
  export const getPurchaserAuthenticationStatus = (params, method) =>
    request({
      url: baseURL + `/purchaser-authentication/status`,
      method: "get",
      params,
    });
  
  // 采购商认证结果
  export const getPurchaserAuthenticationResult = (params, method) =>
    request({
      url: baseURL + `/purchaser-authentication/result`,
      method: "get",
      params,
    });
  
  // 采购商新增
  export const postPurchaser = (params, method) =>
    request({
      url: baseURL + `/purchaser`,
      method: "post",
      params,
    });
  
  // 采购商认证新增
  export const postPurchaserAuthentication = (params, method) =>
    request({
      url: baseURL + `/purchaser-authentication`,
      method: "post",
      params,
    });
  
  // 采购商认证审核
  export const putPurchaserAuthenticationAudit = (params, method) =>
    request({
      url:
        baseURL +
        `/purchaser-authentication/${params.id ? params.id : params}/audit`,
      method: "put",
      params,
    });
  
  // 采购商详情
  export const getPurchaserAuthentication = (params, method) =>
    request({
      url:
        baseURL + `/purchaser-authentication/${params.id ? params.id : params}`,
      method: "get",
      params,
    });
  //区域场景配置列表(根据场景类型查询)
  export const getSceneBindAreaList = (params) =>
    request({
      url: baseURL + `/area-scene-configs/scene/${params?.sceneType || params}`,
      method: "get",
      params,
    });
  // 区域场景配置查询
  export const getSceneConfig = (params) =>
    request({
      url: baseURL + `/area-scene-config/${params.areaId}/${params.sceneType}`,
      method: "get",
      params,
    });
  // 区域场景配置列表(根据区域主键查询)
  export const getSceneListByAreaId = (params) =>
    request({
      url: baseURL + `/area-scene-configs/area/${params?.areaId || params}`,
      method: "get",
      params,
    });
  // 区域场景配置新增
  export const addAreaScene = (params) =>
    request({
      url: baseURL + "/area-scene-config",
      method: "post",
      params,
    });
  //区域场景配置删除
  export const deleteSceneConfig = (params) =>
    request({
      url: baseURL + `/area-scene-config/${params.areaId}/${params.sceneType}`,
      method: "delete",
      params,
    });
  
  // 三维可视化通过区域获取场景树形列表
  export const getSceneConfigByAreaId = (params) =>
    request({
      url: baseURL + `/area-scene-configs/bim/${params?.areaId || params}`,
      method: "get",
      params,
    });
  // 场景类型列表
  export const getSceneTypePage = (params) =>
    request({
      url: baseURL + `/scene-type/page`,
      method: "get",
      params,
    });
  // 场景类型新增
  export const addSceneType = (params) =>
    request({
      url: baseURL + `/scene-type`,
      method: "post",
      params,
    });
  //场景类型修改
  export const editSceneType = (params) =>
    request({
      url: baseURL + `/scene-type/${params?.id || params}`,
      method: "put",
      params,
    });
  // 场景类型列表
  export const getSceneType = (params) =>
    request({
      url: baseURL + `/scene-type/page`,
      method: "get",
      params,
    });
  // 场景类型删除
  export const deleteSceneType = (params) =>
    request({
      url: baseURL + `/scene-type/${params?.id || params}`,
      method: "delete",
      params,
    });
  //设施场景配置新增
  export const addSceneConfig = (params) =>
    request({
      url: baseURL + `/business-scene-config`,
      method: "post",
      params,
    });
  // 设施场景配置详情
  export const sceneConfigDetail = (params) =>
    request({
      url: baseURL + `/business-scene-config/${businessId}/${sceneType}`,
      method: "get",
      params,
    });
  // 设施场景配置列表(根据业务主键查询)
  export const getSceneConfigByBusinessId = (params) =>
    request({
      url: baseURL + `/business-scene-configs/business/${params.businessId}`,
      method: "get",
      params,
    });
  // 设施场景配置删除
  export const deleteSceneConfigFacility = (params) =>
    request({
      url:
        baseURL +
        `/business-scene-config/${params.businessId}/${params.sceneType}`,
      method: "delete",
      params,
    });
  // 区域场景配置列表(根据场景类型查询)
  export const getSceneBindArea = (params) =>
    request({
      url: baseURL + `/area-scene-configs/scene/${params?.sceneType || params}`,
      method: "get",
      params,
    });
  // 区域场景面板配置列表
  export const sceneConfigPanelList = (params) =>
    request({
      url:
        baseURL + `/area-scene-config/panel/${params.areaId}/${params.sceneType}`,
      method: "get",
      params,
    });
  // 保存区域场景面板配置
  export const saveSceneConfigPanel = (params) =>
    request({
      url: baseURL + `/area-scene-config/panel`,
      method: "post",
      params,
    });
  // 区域场景配置新增
  export const sceneConfigArea = (params) =>
    request({
      url: baseURL + "/area-scene-config",
      method: "post",
      params,
    });
  // 区域场景配置删除
  export const deleteSceneConfigArea = (params) =>
    request({
      url: baseURL + `/area-scene-config/${params.areaId}/${params.sceneType}`,
      method: "delete",
      params,
    });
  // 区域场景配置查询
  export const sceneBindView = (params) =>
    request({
      url: baseURL + `/area-scene-config/${params.areaId}/${params.sceneType}`,
      method: "get",
      params,
    });
  // 用户充值接口 - 查询充值商户
  export const getRechargeUser = (params, method = "get") =>
    request({
      url: baseURL + "/supplier/customers",
      method: method,
      params,
    });
  
// 档位接口 - 档位新增,档位更新
export const postStall = (params,method = "post") =>
request({
  url: baseURL + "/stall",
  method: method,
  params,
});

// 档位接口 - 档位删除, 档位ID查询
export const getStallId = (id,method = "delete") =>
  request({
    url: baseURL + "/stall/" + id,
    method: method,
  });


//获取档位信息详情
export const getStall = (id,type) =>
  request({
    url: baseURL + `/stall/${id}`,
    method: "get",
  });

  // 档位接口 - 档位删除, 档位ID查询
export const deleteStall = (id,method = "delete") =>
request({
  url: baseURL + "/stall/" + id,
  method: method,
});
//下载模板
export const downloadGearTemplate = (data, method = 'post') =>
  request({
    url: baseURL + `/download-template`,
    method: method,
    data,
    responseType: "blob"
  })
//导入模板
export const importGearTemplate = (data, method = 'post') =>
  request({
    url: baseURL + `/import`,
    method: method,
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
