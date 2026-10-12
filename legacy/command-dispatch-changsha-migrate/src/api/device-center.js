import request from "@/utils/request";
let baseURL = "/api/device-center";
export const getDeviceCenterInfo = (params) =>
  request({
    url: baseURL + `/device/${params.id}`,
    method: "get",
    params,
  });
export const getDeviceCenterVideos = (params) => {
  return request({
    url: baseURL + `/device/associated/videos`,
    method: "get",
    params,
  });
};
export const getDeviceInstances = (params) => {
  return request({
    url: `/api/iot/north/device/detail`,
    method: "get",
    params,
  });
};
export const setDevcieCenterDeviceValue = (data) => {
  return request({
    url: baseURL + `/device/prop/value/write`,
    method: "post",
    data,
  });
};

/** 设备实例分页（与 linkage-strategy-migrate device.js getIotDeviceList 一致） */
export const getIotDeviceInstancePage = (params) =>
  request({
    url: baseURL + `/device/instance/page`,
    method: "post",
    params,
  });

/** 指挥调度可视化 SSO 跳转地址（返回可直接打开的 URL 字符串或含 url 字段的对象） */
export const getCommandDispatchSsoUrl = (params) =>
  request({
    url: "/api/changsha-xialing/visualization/command-dispatch/sso-url",
    method: "get",
    params: params || {},
  });
