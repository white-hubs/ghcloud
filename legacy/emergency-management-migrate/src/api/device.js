import request from "@/utils/request";
let baseURL = "/api/device";

export const tenantUsersPost = data =>
  request({
    url:  "/api/ouaa/authenticated/user-under-tenant/page",
    method: "post",
    data,
  });
// 获取设备类型
export const getDeviceTypsList = params =>
  request({
    url: baseURL + "/device/genre/search",
    method: "get",
    params,
  });
// 获取设备型号
export const getDeviceModelList = params =>
  request({
    url: baseURL + "/device/model/list",
    method: "get",
    params,
  });
// 设备型号属性列表
export const getModelAttribute = params =>
  request({
    url: baseURL + `/device/model/${params.modelId}/associated-attribute`,
    method: "get",
    params,
  });
// 获取型号事件列表
export const getModelEvent = params =>
  request({
    url: baseURL + `/device/mode/event/list/${params?.modelId || params}`,
    method: "get",
    params,
  });
// 设备实列列表
export const getIotDeviceList = params =>
  request({
    url: baseURL + "/device/instance/list-page",
    method: "get",
    params,
  });

//获取单设备实时属性
export const getDeviceAttribute = params =>
  request({
    url: baseURL + `/device/instance/${params.id}/running/attr`,
    method: "get",
    params,
  });
// 型号下的事件定义列表
export const deviceModelEventList = params =>
  request({
    url: baseURL + `/device/model/${params.modelId}/event/code/list`,
    method: "get",
    params,
  });
