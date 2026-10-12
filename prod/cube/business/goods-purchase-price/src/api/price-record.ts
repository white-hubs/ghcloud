import { Get, Post, Put, Delete, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from '@/typings/global'

const baseUrl = '/product-market'

/** 采价计划分页列表 */
export const getRecordPage = async (params: {
  keyword?: string;
  period?: string;
  taskId?: string;
  goodsCategoryId?: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/goods-pricing-record/page', { params })
}
/** 采价计划详情 */
export const getRecordDetail = async (params: {
  id?: string;
}): Promise<Service.RequestResult> => {
  return Get(baseUrl + `/goods-pricing-record/${params.id}`, { params })
}
/** 采价计划详情 */
export const getRecordStat = async (params?: unknown): Promise<Service.RequestResult> => {
  return Get(baseUrl + '/goods-pricing-record/stat', { params })
}
/** 采价计划新增 */
export const insertRecord = async (params: unknown): Promise<Service.RequestResult> => {
  return Post(baseUrl + '/goods-pricing-record', params)
}
/** 采价计划修改 */
export const updateRecord = async (params: { id: string; }): Promise<Service.RequestResult> => {
  return Put(baseUrl + `/goods-pricing-record/${params.id}`, params)
}
/** 开启或停止计划 */
export const planEnable = async (params: { id: string; enable: boolean; }): Promise<Service.RequestResult> => {
  return Put(baseUrl + `/goods-pricing-record/${params.id}/enable/${params.enable}`, params)
}
// 告警规则修改
export const updatePriceRule = async (params: { id: string; }): Promise<Service.RequestResult> => {
  return Put(baseUrl + `/goods-pricing-record/price/${params.id}`, params)
}

/** 采价计划删除 */
export const deleteRecord = async (params: {
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

export const getCompareStat = async (params: {
  goodsCategoryIds?: string[];
  period?: string;
  goodsCategoryName?: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/goods-pricing-record/compare/stat', { params })
}
