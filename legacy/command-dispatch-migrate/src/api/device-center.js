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
  })
}
export const getDeviceInstances = (params) => {
  return request({
    url: `/api/iot/north/device/detail`,
    method: "get",
    params,
  })
}
export const setDevcieCenterDeviceValue = (data) => {
  return request({
    url: baseURL + `/device/prop/value/write`,
    method: "post",
    data
  })
}
