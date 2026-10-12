import request from "@/utils/request";

let baseURL = "/api/securitymanagement";
import { cubeDeviceCenterService } from "@/api/service";

// 正常状态设备数
export const getGroupAttributive = params =>
  request({
    url: baseURL + `/group-attributive/${params.applicationCode}`,
    method: "get",
    params,
  });
// 正常状态设备数
export const getDeviceStatusNumber = params =>
  request({
    url: baseURL + `/getStatusList/${params.applicationCode}`,
    method: "get",
    params,
  });

//设备关联-列表选项
export const getDevices = params => cubeDeviceCenterService.getDeviceInstancePageAll(params)

//设备关联-列表选项批量
export const addBatchSecurityDevice = (data) =>
  request({
    url: baseURL + `/add-security-device`,
    method: "post",
    data,
  });
// 设备类型下拉
export const getDeviceGenre = params => cubeDeviceCenterService.getIotProductCategoryTree()

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
export const editConfiguration = data =>
  request({
    url: baseURL + `/updateDeviceMonitor/${data.id}`,
    method: "put",
    data,
  });

// 获取组态信息
export const getConfiguration = params =>
  request({
    url: baseURL + `/getDeviceMonitor/${params.applicationCode}`,
    method: "get",
    params,
  });


// 获取产品型号 
export const getApplicationProductModels = params =>
  request({
    url: baseURL + `/getApplicationModels/${params.applicationCode}`,
    method: "get",
    params,
  });
export const getDevicePanelConfig = (params) =>
  request({
    url: baseURL + `/security-panel-config`,
    method: "get",
    params
  })
export const getDevicePanelConfigList = (data) =>
  request({
    url: baseURL + `/security-panel-config/list-query`,
    method: "post",
    data
  })
export const saveDevicePanelConfig = (data) =>
  request({
    url: baseURL + `/security-panel-config`,
    method: "post",
    data
  })
  //条件删除设备
  export const clearSecurityDevice = (data) =>
    request({
      url: baseURL + `/delete/condition/security-device`,
      method: "delete",
      data
    }) 