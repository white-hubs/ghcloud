import request from "@/utils/request";

const baseURL = "/api/iot";
export const getNorthDeviceDetail = (params, type) =>
  request({
    url: baseURL + `/north/device/detail`,
    method: "get",
    params,
  });
