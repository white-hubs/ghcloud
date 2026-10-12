import request from "../service/request";
const baseURL = "/api/prepaid";
/**
 * 电表日用能统计
 */
export function powerUserDayStat<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `${baseURL}/powerUserDay/stat`,
    method: "GET",
    params,
  });
}
/**
 * 电表分页列表
 */
export function ammeterPage<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `${baseURL}/ammeter/page`,
    method: "GET",
    params,
  });
}
/**
 * 水表日用能统计
 */
export function waterUserDayStat<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `${baseURL}/waterUserDay/stat`,
    method: "GET",
    params,
  });
}
/**
 * 水表分页列表
 */
export function waterMeterPage<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `${baseURL}/waterMeter/page`,
    method: "GET",
    params,
  });
}
/**
 * 电表状态统计
 */
export function ammeterStatStatus<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `${baseURL}/ammeter/stat/status`,
    method: "GET",
    params,
  });
}
