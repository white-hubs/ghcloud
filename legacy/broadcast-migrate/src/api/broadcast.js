import request from "@/utils/request";
let baseURL = "/api/broadcast";

// 广播记录分页
export const getbroadcastplayPage = params =>
  request({
    url: baseURL + `/broadcast-play-record/page`,
    method: "get",
    params,
  });
// 广播模板分页
export const getbroadcastPage = params =>
  request({
    url: baseURL + `/broadcast-template/page`,
    method: "get",
    params,
  });
// 新增广播模板
export const addbroadcast = data =>
  request({
    url: baseURL + `/broadcast-template`,
    method: "post",
    data,
  });
// 编辑广播模板
export const editbroadcast = (id, data) =>
  request({
    url: baseURL + `/broadcast-template/${id}`,
    method: "put",
    data,
  });

// 删除广播模板
export const deletebroadcast = params =>
  request({
    url: baseURL + `/broadcast-template/${params.id || params}`,
    method: "delete",
  });
//设备关联-列表选项
export const getDevices = params =>
  request({
    url: baseURL + `/getDevices/${params.applicationCode}`,
    method: "get",
    params,
  });
// 设备类型下拉
export const getDeviceGenre = params =>
  request({
    url: baseURL + `/getDeviceGenre`,
    method: "get",
    params,
  });
// 设备列表分页
export const getSecurityDevicePage = params =>
  request({
    url: `/api/securitymanagement/getSecurityDevicePage/${params.applicationCode}`,
    method: "get",
    params,
  });
// 设备关联导入
export const addSecurityDevice = data =>
  request({
    url: baseURL + `/addSecurityDevice`,
    method: "post",
    data,
  });
// 广播规则分页
export const getBroadcastRulePage = params =>
  request({
    url: baseURL + `/broadcast-play-rule/page`,
    method: "get",
    params,
  });
// 获取广播规则详情
export const getBroadcastRuleInfo = params =>
  request({
    url: baseURL + `/broadcast-play-rule/${params.id}`,
    method: "get",
    params,
  });
// 新增广播规则
export const addBroadcastRule = data =>
  request({
    url: baseURL + `/broadcast-play-rule`,
    method: "post",
    data,
  });
// 更新广播规则
export const updateBroadcastRule = (id, data) =>
  request({
    url: baseURL + `/broadcast-play-rule/${id}`,
    method: "put",
    data,
  });
// 删除广播规则
export const deleteBroadcastRule = id =>
  request({
    url: baseURL + `/broadcast-play-rule/${id}`,
    method: "delete",
  });
// 更新规则启用禁用
export const updateRuleEnabled = (id, data) =>
  request({
    url: baseURL + `/broadcast-play-rule/${id}/enabled/${data}`,
    method: "put",
  });