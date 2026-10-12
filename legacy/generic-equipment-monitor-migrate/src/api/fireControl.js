import request from "@/utils/request";
import { cubeDeviceCenterService } from "./service";
import { message } from "ant-design-vue";
let baseURL = "/api/securitymanagement";
let baseURL1 = "/api/file";
let baseURL2 = "/api/changsha-xialing";
export const uploadFile = (params, type) =>
  request({
    url: `/api/file/file`,
    method: "post",
    params,
  });
// ----------消防中心-----------------
export const getTenantHome = params =>
  request({
    url: baseURL + "/getTenant",
    method: "get",
    params,
  });
export const getRoomStatistics = params =>
  request({
    url: baseURL + "/getRoomStatistics",
    method: "get",
    params,
  });
export const getRoomRateList = params =>
  request({
    url: baseURL + "/getRoomRateList",
    method: "get",
    params,
  });

// ----------设备监测-----------------
export const getComAreaTree = params =>
  request({
    url: baseURL + `/getAreaTree/${params.applicationCode}`,
    method: "get",
    params,
  });
export const getComApplicationGenreVo = params =>
  request({
    url: baseURL + `/getApplicationGenreVo/${params.applicationCode}`,
    method: "get",
    params,
  });
export const getComDeviceCollection = params =>
  request({
    url: baseURL + `/getDeviceCollection/${params.applicationCode}`,
    method: "get",
    params,
  });
export const getComStatusList = params =>
  request({
    url: baseURL + `/getStatusList/${params.applicationCode}`,
    method: "get",
    params,
  });
/**获取耗电量 */
export const powerConsumption = params =>
  request({
    url: baseURL + `/power-consumption`,
    method: "get",
    params,
  });
export const getDeviceMonitoringPage = params =>
  request({
    url: baseURL + `/getDeviceMonitoringPage/${params.applicationCode}`,
    method: "get",
    params,
  });

export const addDeviceCollection = data =>
  request({
    url: baseURL + `/addDeviceCollection`,
    method: "post",
    data,
  });
export const getDeviceInfo = (params) => cubeDeviceCenterService.getDeviceInstanceDetail({deviceId:params.deviceId}).catch(e=>{
  message.error(e.toJSON().errorMessage)
})
  
export const getDeviceVideosInfo = (deviceId) => cubeDeviceCenterService.getDeviceAssociatedVideos(deviceId).catch(e=>{
  message.error(e.toJSON().errorMessage)
})
  
export const getAttributeByDeviceIDList = data =>
  request({
    url:
      "/api/securitymanagement" +
      `/getAttributeByDeviceIDList/${data.deviceId}`,
    method: "get",
    
  });
export const getHistorical = data =>
  request({
    url:
      "/api/securitymanagement" +
      `/historical-attribute`,
    method: "post",
    data,
  });
export const getDeviceHistoryData = data =>
  request({
    url: baseURL + `/getDeviceHistoryData`,
    method: "post",
    data,
  });

export const setDroneControlPermission = data =>
  request({
    url: baseURL2 +"/drone/operations/control-permission",
    method: "post",
    data,
  });

export const dronePowerOn = data =>
  request({
    url: baseURL2 + "/drone/operations/power-on",
    method: "post",
    data,
  });

export const droneTakeOff = data =>
  request({
    url: baseURL2 + "/drone/operations/take-off",
    method: "post",
    data,
  });

export const droneHover = data =>
  request({
    url: baseURL2 + "/drone/operations/hover",
    method: "post",
    data,
  });

export const droneReturnPrecision = data =>
  request({
    url: baseURL2 + "/drone/operations/return/precision",
    method: "post",
    data,
  });

export const droneFlyAction = data =>
  request({
    url: baseURL2 + "/drone/operations/fly-action",
    method: "post",
    data,
  });

// ----------类型数据-----------------
