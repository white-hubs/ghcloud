import request from "@/utils/request";
let baseURL = "/api/mdata/area";
// 获取指定层级区域列表
export const getArea = (params, method = "get") =>
  request({
    url: baseURL + `/list`,
    method: method,
  });
  export const getAreaByLevel = (params, method = "get") =>
  request({
    url: baseURL + `/${params.level}/level`,
    method: method,
  });
