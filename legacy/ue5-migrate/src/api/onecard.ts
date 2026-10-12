import request from "../service/request";
const baseURL = '/api/onecard/'

/**
 * @说明 交易金额情况统计
 * @returns
 */
export function transactionAmountStat<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/transaction/amount/stat`,
      method: "GET",
      params
  });
}
/**
 * @说明 交易金额按交易类型统计
 * @returns
 */
export function transactionTypeStat<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/transaction/amount/type/stat`,
      method: "GET",
      params
  });
}
/**
 * @说明 交易金额按时间统计（趋势）
 * @returns
 */
export function transactionTrendStat<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/transaction/amount/time/trend/stat`,
      method: "GET",
      params
  });
}
/**
 * @说明 按账户统计交易金额（top10）
 * @returns
 */
export function transactionUserStat<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/transaction/amount/user/stat`,
      method: "GET",
      params
  });
}
/**
 * @说明 账户状态统计
 * @returns
 */
export function accountStatusStat<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/account/status/stat`,
      method: "GET",
      params
  });
}
/**
 * @说明 交易分数情况统计
 * @returns
 */
export function transactionCopiesStat<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/transaction/copies/stat`,
      method: "GET",
      params
  });
}
/**
 * @说明 交易次数按时间统计（趋势）
 * @returns
 */
export function transactionCopiesStatTime<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/transaction/copies/time/trend/stat`,
      method: "GET",
      params
  });
}
/**
 * @说明 交易份数按类型统计
 * @returns
 */
export function transactionCopiesTypeStat<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/transaction/copies/type/stat`,
      method: "GET",
      params
  });
}
/**
 * @说明 获取食堂消费金额统计
 * @returns
 */
export function canteenConsumptionAmount<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/canteen-order/consumption/amount`,
      method: "GET",
      params
  });
}
/**
 * @说明 获取食堂消费人数统计
 * @returns
 */
export function canteenConsumptionPersonCount<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/canteen-order/consumption/person-count`,
      method: "GET",
      params
  });
}
/**
 * @说明 获取食堂消费金额趋势统计
 * @returns
 */
export function canteenConsumptionAmountTrend<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/canteen-order/consumption/amount-trend`,
      method: "GET",
      params
  });
}
/**
 * @说明 获取用户食堂消费金额统计
 * @returns
 */
export function canteenConsumptionAccountStat<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/canteen-order/consumption/account-stat`,
      method: "GET",
      params
  });
}
/**
 * @说明 获取食堂消费金额窗口统计
 * @returns
 */
export function canteenConsumptionWindowStat<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/canteen-order/consumption/window-stat`,
      method: "GET",
      params
  });
}
/**
 * @说明 获取消费用户数趋势统计
 * @returns
 */
export function canteenConsumptionUserNumberTrend<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/canteen-order/consumption/user-number-trend`,
      method: "GET",
      params
  });
}