import request from "@/utils/request";
let baseURL = "/api/securitymanagement";
// 正常状态设备数
export const getDeviceStatusNumber = params =>
  request({
    url: baseURL + `/getStatusList/${params.applicationCode}`,
    method: "get",
    params,
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
    url: baseURL + `/getSecurityDevicePage/${params.applicationCode}`,
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
// 删除设备
export const deleteSecurityDevice = params =>
  request({
    url: baseURL + `/deleteSecurityDevice/${params.id || params}`,
    method: "delete",
  });
export const deleteSecurityDeviceBatch = params =>
  request({
    url: baseURL + `/deleteSecurityDeviceBatch`,
    method: "delete",
    params,
  });
// 添加组态
export const addConfiguration = data =>
  request({
    url: baseURL + "/addDeviceMonitor",
    method: "post",
    data,
  });

// 删除组态
export const deleteConfiguration = params =>
  request({
    url: baseURL + `/deleteDeviceMonitor/${params?.id || params}`,
    method: "delete",
  });

// 编辑组态
export const editConfiguration = (id,params) =>
  request({
    url: baseURL + `/updateDeviceMonitor/${id}`,
    method: "put",
    data:params,
  });

// 获取组态信息
export const getConfiguration = params =>
  request({
    url: baseURL + `/getDeviceMonitor/${params.applicationCode}`,
    method: "get",
    params,
  });
