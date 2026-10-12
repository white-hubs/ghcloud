import request from "../service/request";
const baseURL = "/api/iot";
export const getNorthDeviceDetail = (params) =>
  request({
    url: baseURL + `/north/device/detail`,
    method: "get",
    params,
  });
