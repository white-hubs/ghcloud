import request from "../service/request";
const baseURL = "/api/emergency";

/**
 * 应急人员分类统计
 */
export function emergencyUserStats<T extends Record<string, any>>() {
  return request({
    url: baseURL + `/emergency-user/stat`,
    method: "GET",
  });
}
/**
 * 应急设施使用统计
 */
export function emergencyFacilityStat<T extends Record<string, any>>(params?: T) {
  return request({
    url: baseURL + `/emergency-facility/stat`,
    method: "GET",
    params,
  });
}
/**
 * 应急设备使用统计
 */
export function emergencyDeviceStat<T extends Record<string, any>>(params?: T) {
  return request({
    url: baseURL + `/emergency-device/stat`,
    method: "GET",
    params,
  });
}
/**
 * 应急资金趋势统计
 */
export function emergencyRecordTrend<T extends Record<string, any>>(params?: T) {
  return request({
    url: baseURL + `/emergency-fund-inout-record/trend/stat`,
    method: "GET",
    params,
  });
}
/**
 * 应急物资库存统计
 */
export function emergencySuppliesStock<T extends Record<string, any>>(params?: T) {
  return request({
    url: baseURL + `/emergency-supplies/stock/stat`,
    method: "GET",
    params,
  });
}
/**
 * 应急设备分页查询
 */
export function emergencyDevicePage<T extends Record<string, any>>(params?: T) {
  return request({
    url: baseURL + `/emergency-device/page`,
    method: "GET",
    params,
  });
}
