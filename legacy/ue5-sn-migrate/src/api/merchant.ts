import request from "../service/request";
const baseURL = '/api/project-merchant'

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
 * @说明 安全生产值排名
 * @returns
 */
export function visualizationRanking<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/visualization/safeProduction/ranking",
      method: "GET",
      params,
  });
}
/**
 * @说明 安全生产值占比
 * @returns
 */
export function visualizationRroportion<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/visualization/safeProduction/proportion",
      method: "GET",
      params,
  });
}
/**
 * @说明 问卷调查统计
 * @returns
 */
export function visualizationQuestionnaire<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/visualization/questionnaire",
      method: "GET",
      params,
  });
}
/**
 * @说明 诚信经营占比
 * @returns
 */
export function visualizationProportion<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/visualization/operating/proportion",
      method: "GET",
      params,
  });
}
/**
 * @说明 诚信经营值统计
 * @returns
 */
export function visualizationPrice<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/visualization/operating/price",
      method: "GET",
      params,
  });
}
/**
 * @说明 商户合同统计
 * @returns
 */
export function visualizationContractCount<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/visualization/contract/count",
      method: "GET",
      params,
  });
}
/**
 * @说明 商户列表
 * @returns
 */
export function companiesPage<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL + "/companies/page",
      method: "GET",
      params,
  });
}
/**
 * @说明 工单统计排名
 * @returns
 */
export function getFaultyEquipmentTop<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: "/api/maintain/getFaultyEquipmentTop",
      method: "GET",
      params,
  });
}
/**
 * @说明 隐患统计
 * @returns
 */
export function getHazardStatistics<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: "/api/maintain/getHazardStatistics",
      method: "GET",
      params,
  });
}
/**
 * @说明 档位分值列表
 * @returns
 */
export function stallScoreTotal<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL+"/stall-score/total",
      method: "GET",
      headers:{
        "backend-ip":'192.168.2.73'
      },
      params,
  });
}
/**
 * @说明 区域列表
 * @returns
 */
export function areasAllGraph<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: baseURL+"/areas/all-graph",
      method: "GET",
      headers:{
        "backend-ip":'192.168.2.73'
      },
      params,
  });
}