import { Get, Post, Put, Delete, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from '@/typings/global'

const baseUrl = '/product-market'

/** 采价计划分页列表 */
export const getPlanPage = async (params: {
  name?: string;
  period?: string;
  status?: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/goods-pricing-plan/page', { params })
}
/** 采价计划详情 */
export const getPlanDetail = async (params: {
  id?: string;
}): Promise<Service.RequestResult> => {
  return Get(baseUrl + `/goods-pricing-plan/${params.id}`, { params })
}
/** 采价计划详情 */
export const getPlanStat = async (params?: unknown): Promise<Service.RequestResult> => {
  return Get(baseUrl + '/goods-pricing-plan/status/stat', { params })
}
/** 采价计划新增 */
export const insertPlan = async (params: unknown): Promise<Service.RequestResult> => {
  return Post(baseUrl + '/goods-pricing-plan', params)
}
/** 采价计划修改 */
export const updatePlan = async (params: { id: string; }): Promise<Service.RequestResult> => {
  return Put(baseUrl + `/goods-pricing-plan/${params.id}`, params)
}
/** 开启或停止计划 */
export const planEnable = async (params: { id: string; enable: boolean; }): Promise<Service.RequestResult> => {
  return Put(baseUrl + `/goods-pricing-plan/${params.id}/enable/${params.enable}`, params)
}

/** 采价计划删除 */
export const deletePlan = async (params: {
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
