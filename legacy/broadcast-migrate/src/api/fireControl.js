import request from "@/utils/request";
let baseURL = "/api/securitymanagement";

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
export const electricityDownloadExcel = params =>
  request({
    url: baseURL + `/electricityDownloadExcel`,
    method: "get",

    params,
    responseType: "blob",
  });
export const getDistributionsTimeRecordDetails = params =>
  request({
    url: baseURL + `/getDistributionsTimeRecordDetails`,
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
export const getDeviceMonitoringPage = params =>
  request({
    url: baseURL + `/getDeviceMonitoringPage/ELECTRICAL`,
    method: "get",
    params,
  });
export const getElectricityTimeRecord = params =>
  request({
    url: baseURL + `/getElectricityTimeRecord`,
    method: "get",
    params,
  });
// 园区配电
export const getDistributionTimeRecord = params =>
  request({
    url: baseURL + `/getDistributionTimeRecord`,
    method: "get",
    params,
  });
export const addDeviceCollection = data =>
  request({
    url: baseURL + `/addDeviceCollection`,
    method: "post",
    data,
  });
export const getDeviceInfo = params =>
  request({
    url: baseURL + `/getDeviceInfo/${params.deviceId}`,
    method: "get",
    params,
  });
export const getDeviceVideosInfo = params =>
  request({
    url:
      "/api/device/device/instance" +
      `/${params.deviceInstanceId}/associated/videos`,
    method: "get",
  });
export const getAttributeByDeviceIDList = params =>
  request({
    url:
      "/api/securitymanagement" +
      `/getAttributeByDeviceIDList/${params.deviceId}`,
    method: "get",
    params,
  });
export const getDeviceHistoryData = data =>
  request({
    url: baseURL + `/getDeviceHistoryData`,
    method: "post",
    data,
  });
// 配电导出
export const distributionsDownloadExcel = params =>
  request({
    url: baseURL + `/distributionsDownloadExcel`,
    method: "get",
    params,
    responseType: "blob",
  });
// ----------采集配置-----------------
//查询类型列表
export const getTypeList = params =>
  request({
    url: baseURL + `/type-data/${params.tag}/list`,
    method: "get",
    params,
  });

export const getCollectConfigure = params =>
  request({
    url: baseURL + `/getCollectConfigure/ELECTRICAL`,
    method: "get",
    params,
  });

export const getapplicationdevice = params =>
  request({
    url: baseURL + `/application-device/ELECTRICMANAGE`,
    method: "get",
    params,
  });
export const addCollectConfigure = data =>
  request({
    url: baseURL + `/addCollectConfigure`,
    method: "post",
    data,
  });
/**
 *
 * 用电详情
 */
export const getElectricityTimeRecordDetails = params =>
  request({
    url: baseURL + `/getElectricityTimeRecordDetails`,
    method: "get",
    params,
  });
