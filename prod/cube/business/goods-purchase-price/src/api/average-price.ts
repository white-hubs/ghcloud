import { Get, Post, Put, Delete, type BaseAPIResult, service } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from '@/typings/global'

const baseUrl = '/product-market'

/** 采价计划分页列表 */
export const getAveragePage = async (params: {
  goodsCategoryName?: string;
  period?: string;
  goodsCategoryIds?: string[] | number[];
}): Promise<BaseAPIResult<PageResult>> => {
  return Post(baseUrl + '/goods-pricing-record/compare/stat', params)
}
/** 采价计划详情 */
export const getAverageDetail = async (params: {
  id?: string;
}): Promise<Service.RequestResult> => {
  return Get(baseUrl + `/goods-pricing-plan/${params.id}`, { params })
}
/** 采价计划详情 */
export const getAverageStat = async (params?: unknown): Promise<Service.RequestResult> => {
  return Get(baseUrl + '/goods-pricing-plan/status/stat', { params })
}
/** 采价计划新增 */
export const insertAverage = async (params: unknown): Promise<Service.RequestResult> => {
  return Post(baseUrl + '/goods-pricing-plan', params)
}
/** 采价计划修改 */
export const updateAverage = async (params: { id: string; }): Promise<Service.RequestResult> => {
  return Put(baseUrl + `/goods-pricing-plan/${params.id}`, params)
}
/** 开启或停止计划 */
export const planEnable = async (params: { id: string; enable: boolean; }): Promise<Service.RequestResult> => {
  return Put(baseUrl + `/goods-pricing-plan/${params.id}/enable/${params.enable}`, params)
}

/** 采价计划删除 */
export const deleteAverage = async (params: {
  id?: string;
}): Promise<Service.RequestResult> => {
  return Delete(baseUrl + `/goods-pricing-plan/${params.id}`)
}
/** 查询品类树 */
export const getCategoryTree = async (params: {
  code?: string;
  name?: string;
}): Promise<Service.RequestResult> => {
  return Get(baseUrl + '/market-goods-category/tree', { params })
}
export const exportCompare = async (data: {
  goodsCategoryIds?: number[] | string[];
  period?: string;
}): Promise<Service.RequestResult> => {
  return service.post(baseUrl + '/goods-pricing-record/compare/stat/export', data)
}
export const exportRecord = async (data: {
  goodsCategoryId?: string;
  period?: string;
}): Promise<Service.RequestResult> => {
  return service.post(baseUrl + '/goods-pricing-record/export', data)
}
