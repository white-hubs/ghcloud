import request from "@/utils/request";
let baseURL = "/api/bim";

//模型列表
export const getBimModelList = (params, type) =>
  request({
    url: baseURL + "/bim-models",
    method: "get",
    params,
  });
// 新增模型
export const addModel = (params, type) =>
  request({
    url: baseURL + "/bim-model",
    method: "post",
    params,
  });

//删除模型
export const deleteBimModel = (params, type) =>
  request({
    url: baseURL + `/bim-model/${params.id ? params.id : params}`,
    method: "delete",
    params,
  });
// 模型详情
export const bimModelDetails = (params, type) =>
  request({
    url: baseURL + `/bim-model/${params.id ? params.id : params}`,
    method: "get",
    params,
  });
// 模型构建列表
export const modelElementList = (params) =>
  request({
    url: baseURL + "/bim-elements",
    method: "get",
    params,
  });
// 模型构件列表(用于视角绑定)
export const bindViewELementList = (params) =>
  request({
    url: baseURL + "/bim-elements/view-bind",
    method: "get",
    params,
  });

// 获取模型构建列表
export const getModelElement = (params, type) =>
  request({
    url: baseURL + "/bim-elements",
    method: "get",
    params,
  });

// 模型构建列表(用于绑定视角)
export const getBimViewElement = (params, type) =>
  request({
    url: baseURL + "/bim-elements/view-bind",
    method: "get",
    params,
  });

// 模型详情(通过区域id查询)
export const areaBindModelDetail = (params, type) =>
  request({
    url: baseURL + `/bim-model/area/${params.areaId ? params.areaId : params}`,
    method: "get",
    params,
  });

// 模型/构建视角绑定
export const bimViewBind = (params) =>
  request({
    url: baseURL + "/bim-view-bind",
    method: "post",
    params,
  });
// 获取绑定的视角列表
export const bimViewList = (params) =>
  request({
    url: baseURL + `/bim-view-binds/${params.businessName}`,
    method: "get",
    params,
  });

// 修改视角
export const editBimView = (params) =>
  request({
    url: baseURL + `/bim-view-bind/${params.id}`,
    method: "put",
    params,
  });

// 删除视角
export const deleteBimView = (params) =>
  request({
    url: baseURL + `/bim-view-bind/${params}`,
    method: "delete",
    params,
  });

// 导航绑定新增
export const addModelNav = (params) =>
  request({
    url: baseURL + "/bim-navigation-bind",
    method: "post",
    params,
  });
// 导航绑定详情
export const modelNavDetail = (params) =>
  request({
    url: baseURL + `/bim-navigation-bind/${params.businessId}`,
    method: "get",
    params,
  });
// 删除导航绑定
export const deleteModelNav = (params) =>
  request({
    url: baseURL + `/bim-navigation-bind/${parmas.businessId}`,
    method: "delete",
    params,
  });
// 设备与模型构建绑定
export const elementBindDevice = (params) =>
  request({
    url: baseURL + "/bim-element-bind",
    method: "post",
    params,
  });
// bim模型绑定详情(根据业务主键查询)
export const bindDetailByDevice = (params) =>
  request({
    url: baseURL + `/bim-element-bind/business/${params.businessId}`,
    method: "get",
    params,
  });
// bim模型绑定详情(根据构件编号查询)
export const bindeDetailByElement = (params) =>
  request({
    url: baseURL + `/bim-element-bind/element-code/${params.bimElementCode}`,
    method: "get",
    params,
  });
// 删除构建绑定
export const deleteElementBind = (params) =>
  request({
    url: baseURL + `/bim-element-bind/${params.bimElementCode}`,
    method: "delete",
    params,
  });
// 模型楼层绑定新增
export const addModelLevelBind = (params) =>
  request({
    url: baseURL + `/bim-level-bind`,
    method: "post",
    params,
  });
// 模型楼层绑定详情
export const getModelLevelBindDetail = (params) =>
  request({
    url: baseURL + `/bim-level-bind/${params.bimAreaId}/${params.bimLevelName}`,
    method: "get",
    params,
  });
// bim模型楼层列表(根据主模型系统区域主键查询)
export const getBimLevelBindByBimAreaId = (params) =>
  request({
    url: baseURL + `/bim-level-bind/${params?.bimAreaId || params}`,
    method: "get",
    params,
  });
// 模型楼层绑定删除
export const deleteBimLevelBind = (params) =>
  request({
    url: baseURL + `/bim-level-bind/${params.bimAreaId}/${params.bimLevelName}`,
    method: "delete",
    params,
  });
// bim模型楼层列表(根据主模型系统区域主键查询)
export const getBimLevelFloors = (params) =>
  request({
    url: baseURL + `/bim-level-binds/${params?.bimAreaId || params}`,
    method: "get",
    params,
  });
