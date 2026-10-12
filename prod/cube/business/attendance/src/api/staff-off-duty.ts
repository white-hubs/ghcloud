import { type BaseAPIResult, Get, Post, Delete, service } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './common-type'

/** 离岗规则 列表页 */
export const offDutyRulesPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/att/leavePost/rule/page', { params })
}

/** 离岗规则 详情 */
export const offDutyRulesDetail = async (params: { id: string; }): Promise<BaseAPIResult<OffDutyRules>> => {
  return Get('/attendance/att/leavePost/rule/detail?id=' + params.id)
}

/** 离岗规则 新增 */
export const offDutyRulesInsert = async (params: OffDutyRules): Promise<BaseAPIResult<unknown>> => {
  return Post('/attendance/att/leavePost/rule/add', params)
}
/** 离岗规则 编辑 */
export const offDutyRulesUpdate = async (params: OffDutyRules & { id: string; }): Promise<BaseAPIResult<unknown>> => {
  return Post('/attendance/att/leavePost/rule/edit', params)
}

/** 离岗规则 删除 */
export const offDutyRulesDelete = async (params: { id: string; }): Promise<BaseAPIResult<unknown>> => {
  return Delete('/attendance/att/leavePost/rule/remove?id=' + params.id)
}

/** 离岗台账 */
export const offDutyLedgerPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/att/leavePost/ledger/page', { params })
}

/** 离岗台账 导出 */
export const offDutyLedgerExport = async (params: unknown): Promise<BaseAPIResult> => {
  return service.get('/attendance/att/leavePost/ledger/export', { params })
}

export interface OffDutyRules {
  /**
   * 提前申请
   */
  beforeApply: boolean;
  /**
   * 时长计算方式，工作日：WORKING_DAY，自然日：CALENDAR_DAY
   */
  calculationWay: string;

  /**
   * 最小请假时间
   */
  minAskUnit: number;
  /**
   * 规则名称
   */
  name: string;
}
