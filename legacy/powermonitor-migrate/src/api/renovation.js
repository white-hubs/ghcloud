import request from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/request";
let baseURL = "/api/maintain";

// 列表
export const renovation = (params, method) =>
  request({
    url: baseURL + `/retrofit/receipt/page`,
    method: method,
    params,
  })

// 详情
export const renovationId = (params, method) =>
  request({
    url: baseURL + `/retrofit/receipt/${params?.id ? params?.id : params}`,
    method: method,
    params,
  })

// 详情
export const renovationAdd = (data, method) =>
  request({
    url: baseURL + `/retrofit/receipt/submit`,
    method: method,
    data,
  })

// 详情
export const renovationConfirm = (data, method) =>
  request({
    url: baseURL + `/retrofit/receipt/confirm`,
    method: method,
    data,
  })

// 改造工单
export const renovationOrder = (params, method) =>
  request({
    url: baseURL + `/retrofit/ticket/page`,
    method: method,
    params,
  })

// 改造工单详情
export const renovationOrderId = (params, method) =>
  request({
    url: baseURL + `/retrofit/ticket/${params?.id ? params?.id : params}`,
    method: method,
  })

// 改造工单评估
export const renovationOrderAsse = (data, method) =>
  request({
    url: baseURL + `/retrofit/ticket/assessment`,
    method: method,
    data
  })

// 获取用户配置
export const getRenovConfig = (data, method) => {
  return request({
    url: baseURL + `/retrofit/ticket/confirm-user`,
    method: method,
    data
  })
}


// 保存用户配置
export const renovConfig = (data, method) => {
  return request({
    url: baseURL + `/retrofit/ticket/collocate-confirm-user`,
    method: method,
    data
  })
}

// 消息枚举
export const messageEnum = (data, method) =>
  request({
    url: baseURL + `/retrofit/ticket/confirm-user/notify-channels`,
    method: method,
    data
  })

