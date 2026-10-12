import { Get, Post, Put, Delete, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from '@/typings/global'

const baseUrl = '/product-market'

/** 采价计划分页列表 */
export const getTaskPage = async (params: {
  name?: string;
  period?: string;
  status?: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/goods-pricing-task/page', { params })
}
/** 采价计划详情 */
export const getTaskDetail = async (params: {
  id?: string;
}): Promise<Service.RequestResult> => {
  return Get(baseUrl + `/goods-pricing-task/${params.id}`, { params })
}
/** 采价计划详情 */
export const getTaskStat = async (params?: unknown): Promise<Service.RequestResult> => {
  return Get(baseUrl + '/goods-pricing-task/stat', { params })
}
/** 采价计划新增 */
export const insertTask = async (params: unknown): Promise<Service.RequestResult> => {
  return Post(baseUrl + '/goods-pricing-task', params)
}
/** 采价计划修改 */
export const updateTask = async (params: { id: string; }): Promise<Service.RequestResult> => {
  return Put(baseUrl + `/goods-pricing-task/${params.id}`, params)
}
/** 开启或停止计划 */
export const planEnable = async (params: { id: string; enable: boolean; }): Promise<Service.RequestResult> => {
  return Put(baseUrl + `/goods-pricing-task/${params.id}/enable/${params.enable}`, params)
}

/** 采价计划删除 */
export const deleteTask = async (params: {
  id?: string;
}): Promise<Service.RequestResult> => {
  return Delete(baseUrl + `/goods-pricing-task/${params.id}`)
}
/** 查询品类树 */
export const getCategoryTree = async (params: {
  code?: string;
  name?: string;
}): Promise<Service.RequestResult> => {
  return Get(baseUrl + '/market-goods-category/tree', { params })
}
