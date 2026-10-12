import request from "@/utils/request";
let baseURL = "/api/securitymanagement";

// 通过应用型号查设备
export const getDeviceByModel = data =>
  request({
    url: baseURL + `/getDeviceListByModel`,
    method: "post",
    data,
  });
export const getDeviceInfo = params =>
  request({
    url: baseURL + `/getDeviceInfo/${params.deviceId}`,
    method: "get",
    params,
  });
export const getbroadcastDeviceInfo = params =>
  request({
    url:   `/api/broadcast/broadcast-devices`,
    method: "get",
    // params,
  });

 