import { Get, Post, Put, Delete, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from '@/typings/global'

const baseUrl = '/product-market'

/** 采价计划分页列表 */
export const getAlarmPage = async (params: {
  ruleName?: string;
  userName?: string;
  period?: string;
  status?: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/goods-price-warn-record/page', { params })
}
/** 采价计划详情 */
export const getAlarmDetail = async (params: {
  id?: string;
}): Promise<Service.RequestResult> => {
  return Get(baseUrl + `/goods-price-warn-record/${params.id}`, { params })
}
/** 采价计划详情 */
export const getAlarmStat = async (params?: unknown): Promise<Service.RequestResult> => {
  return Get(baseUrl + '/goods-price-warn-record/status/stat', { params })
}
/** 采价计划新增 */
export const insertAlarm = async (params: unknown): Promise<Service.RequestResult> => {
  return Post(baseUrl + '/goods-price-warn-record', params)
}
/** 告警处理 */
export const updateAlarm = async (params: { id: string; }): Promise<Service.RequestResult> => {
  return Put(baseUrl + `/goods-price-warn-record/${params.id}`, params)
}
/** 开启或停止计划 */
export const planEnable = async (params: { id: string; enable: boolean; }): Promise<Service.RequestResult> => {
  return Put(baseUrl + `/goods-price-warn-record/${params.id}/enable/${params.enable}`, params)
}

/** 采价计划删除 */
export const deleteAlarm = async (params: {
  id?: string;
}): Promise<Service.RequestResult> => {
  return Delete(baseUrl + `/goods-price-warn-record/${params.id}`)
}
/** 查询品类树 */
export const getCategoryTree = async (params: {
  code?: string;
  name?: string;
}): Promise<Service.RequestResult> => {
  return Get(baseUrl + '/market-goods-category/tree', { params })
}
