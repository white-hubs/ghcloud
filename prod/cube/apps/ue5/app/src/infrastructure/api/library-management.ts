import request from "../service/request";
const baseURL = "/api/library-management";

/**
 * UE-月度编目工作量统计
 */
export function tidyUpRecordTrend<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: baseURL + `/library/ue/tidyUp/tidyUpRecordTrend`,
    method: "GET",
    params,
  });
}
/**
 * 编目综合统计分页
 */
export function tidyUpStatisticsPage<T extends Record<string, any>>(params?: T) {
  return request({
    url: baseURL + `/library/tidyUp/tidyUpStatisticsPage`,
    method: "GET",
    params,
  });
}
/**
 * 借阅记录趋势
 */
export function borrowRecordTrend<T extends Record<string, any>>(params?: T) {
  return request({
    url: baseURL + `/library/ue/borrow/borrowRecordTrend`,
    method: "GET",
    params,
  });
}
/**
 * 借阅记录热门
 */
export function borrowRecordHotTop<T extends Record<string, any>>(params?: T) {
  return request({
    url: baseURL + `/library/ue/borrow/borrowRecordHotTop`,
    method: "GET",
    params,
  });
}
