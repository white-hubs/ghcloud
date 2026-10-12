import request from "@/utils/request";
let baseURL = "/api/order";
// if (process.env.NODE_ENV === "lzy" || process.env.NODE_ENV === "lrj") {
//   baseURL = "http://192.168.2.89:3100/order";
// }

// 订单管理

export const orderTable = (params, method) =>
  request({
    url: baseURL + `/mall-order/page`,
    method: method,
    params,
  });

export const orderIdPurchase = (params, method) =>
  request({
    url: baseURL + `/order-info/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 订单支付记录

// 新增
export const orderPayAdd = (params, method) =>
  request({
    url: baseURL + `/order-pay-record`,
    method: method,
    params,
  });

// 作废
export const orderPayVoid = (params, method) =>
  request({
    url:
      baseURL + `/order-pay-record/abolish/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 删除
export const orderPayDele = (params, method) =>
  request({
    url: baseURL + `/order-pay-record/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 列表
export const orderPay = (params, method) =>
  request({
    url: baseURL + `/order-pay-record/page`,
    method: method,
    params,
  });

// 批量新增
export const orderPayBatch = (params, method) =>
  request({
    url: baseURL + `/order-pay-record/batch`,
    method: method,
    params,
  });

// 退货单

export const returnTable = (params, method) =>
  request({
    url: baseURL + `/market/order-return/page`,
    method: method,
    params,
  });

export const returnForm = (params, method) =>
  request({
    url: baseURL + `/order-return`,
    method: method,
    params,
  });

export const returnId = (params, method) =>
  request({
    url: baseURL + `/order-return/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 退款记录

// 表格
export const returnRecord = (params, method) =>
  request({
    url: baseURL + `/order-return-record/page`,
    method: method,
    params,
  });

// 添加
export const returnRecordAdd = (params, method) =>
  request({
    url: baseURL + `/order-return-record`,
    method: method,
    params,
  });

// 删除
export const returnRecordId = (params, method) =>
  request({
    url: baseURL + `/order-return-record/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 作废
export const returnRecordVoid = (params, method) =>
  request({
    url:
      baseURL +
      `/order-return-record/abolish/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 订货单

// 分页
export const purchaseOrder = (params, method) =>
  request({
    url: baseURL + `/market/order-info/page`,
    method: method,
    params,
  });

// 核销
export const writeOff = (params, method) =>
  request({
    url: baseURL + `/order-info-write-off/${params.id}/${params.writeOffCode}`,
    method: method,
    params,
  });

// 取消
export const orderCancel = (params, method) =>
  request({
    url: baseURL + `/order-info-cancel/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 详情
export const orderDetail = (params, method) =>
  request({
    url: baseURL + `/order-info/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 发货
export const orderSend = (params, method) =>
  request({
    url: baseURL + `/order-info-shipped/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 应收款

// 分页--订单
export const orderRcieve = (params, method) =>
  request({
    url: baseURL + `/order-info/receivables/page`,
    method: method,
    params,
  });

// 分页--客户
export const customerRcieve = (params, method) =>
  request({
    url: baseURL + `/order-info/customer-receivables/page`,
    method: method,
    params,
  });

// 分页--客户订单列表
export const customerOrderList = (params, method) =>
  request({
    url: baseURL + `/order-info/customer-receivables/order/page`,
    method: method,
    params,
  });
