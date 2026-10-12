import { type BaseAPIResult, Get, Post, Delete } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './common-type'

/** 出差规则 列表 */
export const businessTripRulesPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/att/awayBusiness/rule/page', { params })
}

/** 出差规则 详情 */
export const businessTripRulesDetail = async (params: { id: string; }): Promise<BaseAPIResult<BusinessTripRules & { id: string; }>> => {
  return Get('/attendance/att/awayBusiness/rule/detail?id=' + params.id)
}

/** 出差规则 删除 */
export const businessTripRulesDelete = async (params: { id: string; }): Promise<BaseAPIResult> => {
  return Delete('/attendance/att/awayBusiness/rule/remove?id=' + params.id)
}

/** 出差规则 新增 */
export const businessTripRulesInsert = async (params: unknown): Promise<BaseAPIResult<BusinessTripRules>> => {
  return Post('/attendance/att/awayBusiness/rule/add', params)
}

/** 出差规则 更新 */
export const businessTripRulesUpdate = async (params: unknown): Promise<BaseAPIResult<BusinessTripRules>> => {
  return Post('/attendance/att/awayBusiness/rule/edit', params)
}
/** 出差规则 */
export interface BusinessTripRules {
  /**
     * 提前申请
     */
  beforeApply: boolean;
  /**
     * 时长计算方式，工作日：WORKING_DAY，自然日：CALENDAR_DAY
     */
  calculationWay: 'WORKING_DAY' | 'CALENDAR_DAY';
  /**
     * 最小请假时间
     */
  minAskUnit: number;
  /**
     * 规则名称
     */
  name: string;
}
