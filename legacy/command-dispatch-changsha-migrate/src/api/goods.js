import request from "@/utils/request";
let baseURL = "/api/goods";

// 单位

// 商品单位新增
export const goodsUnit = (params, method) =>
  request({
    url: baseURL + "/market/goods-unit",
    method: method,
    params,
  });

// 单位表格

export const unit = (params, method) =>
  request({
    url: baseURL + `/goods-unit/page`,
    method: method,
    params,
  });

// 单位修改

export const unitId = (params, method) =>
  request({
    url: baseURL + `/goods-unit/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 配送方式

// 获取
export const sendType = (params, method) =>
  request({
    url: baseURL + `/distribution-way/list`,
    method: method,
    params,
  });

// 修改
export const sendTypeEdit = (params, method) =>
  request({
    url: baseURL + `/distribution-way/${params.id ? params.id : params}`,
    method: method,
    params,
  });
