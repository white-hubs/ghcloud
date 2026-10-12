import { Get, Post, Put, Delete } from '@ghcloud/ghcloud-business-request'

const baseUrl = '/product-market'

/** 采价计划分页列表 */
export const getAverageTrend = async (params: {
  goodsCategoryIds?: (string | number)[];
  period?: string;
  statType?: string;
}): Promise<Service.RequestResult> => {
  return Post(baseUrl + '/goods-pricing-record/trend/stat', params)
}
export const getAverageTren2 = async (params: {
  goodsCategoryIds?: (string | number)[];
  period?: string;
  statType?: string;
}): Promise<Service.RequestResult> => {
  return Post(baseUrl + '/goods-pricing-record/trend/stat/rtc', { params })
}
/** 采价计划详情 */
export const getAverageDetail = async (params: {
  id?: string;
}): Promise<Service.RequestResult> => {
  return Get(baseUrl + `/goods-pricing-record/${params.id}`, { params })
}
/** 采价计划详情 */
export const getAverageStat = async (params?: unknown): Promise<Service.RequestResult> => {
  return Get(baseUrl + '/goods-pricing-record/status/stat', { params })
}
/** 采价计划新增 */
export const insertAverage = async (params: unknown): Promise<Service.RequestResult> => {
  return Post(baseUrl + '/goods-pricing-record', params)
}
/** 采价计划修改 */
export const updateAverage = async (params: { id: string; }): Promise<Service.RequestResult> => {
  return Put(baseUrl + `/goods-pricing-record/${params.id}`, params)
}
/** 开启或停止计划 */
export const planEnable = async (params: { id: string; enable: boolean; }): Promise<Service.RequestResult> => {
  return Put(baseUrl + `/goods-pricing-record/${params.id}/enable/${params.enable}`, params)
}

/** 采价计划删除 */
export const deleteAverage = async (params: {
  id?: string;
}): Promise<Service.RequestResult> => {
  return Delete(baseUrl + `/goods-pricing-record/${params.id}`)
}
/** 查询品类树 */
export const getCategoryTree = async (params: {
  code?: string;
  name?: string;
}): Promise<Service.RequestResult> => {
  return Get(baseUrl + '/market-goods-category/tree', { params })
}
