import { type BaseAPIResult, Get, Post, Delete, service } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './common-type'

/** 补卡规则 列表 */
export const supplementRulesPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/card-rule/page', { params })
}
/** 补卡规则 列表 */
export const supplementRulesList = async (params?: unknown): Promise<BaseAPIResult<{ id: string;name: string; }[]>> => {
  return Get('/attendance/card-rule/list', { params })
}

/** 补卡规则 详情 */
export const supplementRulesDetail = async (params: { id: string; }): Promise<BaseAPIResult<SupplementRules>> => {
  return Get('/attendance/card-rule/' + params.id)
}

/** 补卡规则 删除 */
export const supplementRulesDelete = async (params: { id: string; }): Promise<BaseAPIResult<SupplementRules>> => {
  return Delete('/attendance/card-rule/' + params.id)
}

/** 补卡规则 新增/更新 */
export const supplementRulesPost = async (params: unknown): Promise<BaseAPIResult<SupplementRules>> => {
  return Post('/attendance/card-rule', params)
}

/** 补卡台账 列表 */
export const supplementLedgerList = async (params?: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/getWorkOmitByPage', { params })
}

/** 补卡台账 导出 */
export const supplementLedgerExport = async (params: unknown): Promise<BaseAPIResult> => {
  return service.get('/attendance/getWorkOmitByPage/excel', { params })
}

/** 补卡明细 列表 */
export const supplementLedgerDetail = async (params?: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/getWorkOmitDetails/page', { params })
}

/** 补卡台账详情 导出 */
export const supplementLedgerDetailExport = async (params: unknown): Promise<BaseAPIResult> => {
  return service.get('/attendance/getWorkOmitDetails/excel', { params })
}
/** 补卡规则 */
export interface SupplementRules {
  content: string[];
  days: number;
  id: string;
  name: string;
  times: number;
  types: string[];
  typeName: string;
  updateTime: number;
}
