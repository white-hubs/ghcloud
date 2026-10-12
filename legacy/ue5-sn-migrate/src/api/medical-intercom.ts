import request from "../service/request";
const baseURL = '/api/securitymanagement'
/**
 * @说明 商户/档位统计
 * @returns
 */
export function visualizationCount<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/visualization/count",
      method: "GET",
      params,
  });
}
/**
 * @说明 呼叫统计
 * @returns
 */
export function callStatistics<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/call-statistics",
      method: "GET",
      params,
  });
}
/**
 * @说明 呼叫趋势
 * @returns
 */
export function callTrends<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/call-trends",
      method: "GET",
      params,
  });
}
/**
 * @说明 呼叫记录
 * @returns
 */
export function callRecords<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/call-records-page",
      method: "GET",
      params,
  });
}
/**
 * @说明 处理记录
 * @returns
 */
export function callProcessingRecords<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/processing-records-page",
      method: "GET",
      params,
  });
}
/**
 * @说明 床位档案
 * @returns
 */
export function bedFile<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/bed-file-page",
      method: "GET",
      params,
  });
}

