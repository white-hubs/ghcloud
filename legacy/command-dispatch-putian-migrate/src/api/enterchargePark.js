import request from "@/utils/request";
let baseURL = "/api/entercharge";

// 车辆管理车辆新增

// 新增
export const carAdd = (params, method) =>
  request({
    url: baseURL + `/pc/car-info`,
    method: method,
    params,
  });

// 修改,删除
export const carEdit = (params, method) =>
  request({
    url: baseURL + `/car-info/${params.id ? params.id : params}`,
    method: method,
    params,
  });
