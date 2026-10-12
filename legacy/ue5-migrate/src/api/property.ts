import request from "../service/request";
const baseURL = '/api/property'
/**
 * 资产分类占比(可选类型)
 */
export function getPropertyByOptType<T extends Record<string, any>>(params?: T) {
    return request<any>({
        url: `${baseURL}/property/visualization/getPropertyByOptType`,
        method: "GET",
        params
    })
}

/** 资产清单 分页 */
export const getPropertyDetailedPage = async (params: {
  pageSize: number;
  pageNumber: number;
  receiveDepId?: string | undefined;
  keyword?: string | undefined;
  status?: string | undefined;
  startTime?: string | undefined;
  purchaseDate?: string | undefined;
  sourceId?: string | undefined;
  typeId?: string | undefined;
  areaId?: string | undefined;
}): Promise<any> => {
  return request<any>({
    url: `${baseURL}/property/detailed/getPropertyDetailedPage`,
    method: "GET",
    params
  })
};

/**
 * 分页查询风险源台账
 */
export function sourceLedgerPage<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: `${baseURL}/risk/source/ledger/page`,
      method: "GET",
      params
  })
}
/**
 * 通过id获取资产履历详情
 */
export function getPropertyHistoryList<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: `${baseURL}/property/history/getPropertyHistoryList`,
      method: "GET",
      params
  })
}
/**
 * 通过id获取资产详情
 */
export function getPropertyDetailed(id) {
  return request<any>({
      url: `${baseURL}/property/detailed/${id}`,
      method: "GET",
  })
}
/**
 * 通过模型code获取资产详情
 */
export function getCodePropertyDetailed(id) {
  return request<any>({
      url: `${baseURL}/property/queryByBimCode/${id}`,
      method: "GET",
  })
}
/**
 * 通过ID获取风险源详情
 */
export function getRiskDetailed(id) {
  return request<any>({
      url: `${baseURL}/risk/source/ledger/queryById/${id}`,
      method: "GET",
  })
}
/**
 * 通过CODE获取风险源详情
 */
export function getCodeRiskDetailed(bimCode) {
  return request<any>({
      url: `${baseURL}/risk/source/ledger/queryByBimCode/${bimCode}`,
      method: "GET",
  })
}
// 资产分页列表查询(根据场景获取)
export async function propertySceneStall<T extends Record<string, unknown>> (params?: T): Promise<any> {
  return request({
    url: baseURL+'/property/bim/config/page',
    method: 'get',
    params,
  })
}
// 风险源分页列表查询(根据场景获取)
export async function riskSceneStall<T extends Record<string, unknown>> (params?: T): Promise<any> {
  return request({
    url: baseURL+'/risk/source/bim/config/page',
    method: 'get',
    params,
  })
}
// 风险源分析
export async function sourceArchiveStatistics<T extends Record<string, unknown>> (params?: T): Promise<any> {
  return request({
    url: baseURL+'/stat/risk/source/archive/statistics',
    method: 'get',
    params,
  })
}
// 资产统计 
export async function overdue<T extends Record<string, unknown>> (params?: T): Promise<any> {
  return request({
    url: baseURL+'/property/visualization/overdue',
    method: 'get',
    params,
  })
}
// 区域资产分布占比 
export async function getPropertyBySourcePie<T extends Record<string, unknown>> (params?: T): Promise<any> {
  return request({
    url: baseURL+'/property/visualization/getPropertyBySourcePie',
    method: 'get',
    params,
  })
}
// 部门资产分布情况 
export async function getPropertyByDepHistogram<T extends Record<string, unknown>> (params?: T): Promise<any> {
  return request({
    url: baseURL+'/property/visualization/getPropertyByDepHistogram',
    method: 'get',
    params,
  })
}
// 资产状态占比 
export async function getPropertyByStatus<T extends Record<string, unknown>> (params?: T): Promise<any> {
  return request({
    url: baseURL+'/property/visualization/getPropertyByStatus',
    method: 'get',
    params,
  })
}
// 资产分类占比 
export async function getPropertyByType<T extends Record<string, unknown>> (params?: T): Promise<any> {
  return request({
    url: baseURL+'/property/visualization/getPropertyByType',
    method: 'get',
    params,
  })
}
// 耗材出库趋势 
export async function getConsumableVisualizationReduceRecord<T extends Record<string, unknown>> (params?: T): Promise<any> {
  return request({
    url: baseURL+'/consumable/visualization/reduceRecord',
    method: 'get',
    params,
  })
}
// 电动车风险源总数
export async function electronMobileStat<T extends Record<string, unknown>> (params?: T): Promise<any> {
  return request({
    url: baseURL+'/risk/source/ledger/electron-mobile/stat',
    method: 'get',
    params,
  })
}
