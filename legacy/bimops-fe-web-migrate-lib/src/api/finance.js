import request from "../utils/request";
let baseURL = "/api/finance";
// let baseURL = "http://192.168.2.149:3100/finance";

//资金总账分页列表
export const getRunningWaterListPage = (params, type) =>
  request({
    url: baseURL + "/running-water/list-page",
    method: "get",
    params,
  });

//资金总账各支付渠道资金统计
export const getRunningWaterReport = (params, type) =>
  request({
    url: baseURL + "/running-water/report/receipt-amount-channel",
    method: "get",
    params,
  });

//业务类型列表
export const getDictBussinessCommand = (params, type) =>
  request({
    url: baseURL + "/dict/bussiness-command",
    method: "get",
    params,
  });

//支付方式列表
export const getDictPayChannel = (params, type) =>
  request({
    url: baseURL + "/dict/pay-channel",
    method: "get",
    params,
  });

//收支方式列表
export const getDictExpensesIncomeWay = (params, type) =>
  request({
    url: baseURL + "/dict/expenses-income-way",
    method: "get",
    params,
  });

//确认收款支付方式列表
export const getDictIncomePayChannel = (params, type) =>
  request({
    url: baseURL + "/dict/income-pay-channel",
    method: "get",
    params,
  });

//收款单分页条件查询
export const getReceiptListPage = (params, type) =>
  request({
    url: baseURL + "/receipt/list-page",
    method: "get",
    params,
  });

// 确认收款
export const postReceiptConfirm = (params, method = "post") =>
  request({
    url: baseURL + "/receipt/confirm",
    method: method,
    params,
  });
