import { type BaseAPIResult, Get, Delete, Post, service } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './common-type'

/** 加班规则 列表 */
export const overtimeRulesPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/work-overtime-rule/page', { params })
}

/** 加班规则 列表 不分页 */
export const overtimeRulesList = async (params?: unknown): Promise<BaseAPIResult<{ id: string;name: string; }[]>> => {
  return Get('/attendance/work-overtime-rule/list', { params })
}
/** 加班台账 新增 */
export const overtimeLedgerPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/getWorkOvertimeLedgerPage', { params })
}
export const overtimeDetailPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/getWorkOvertimeLedgerDetailsPage', { params })
}
/** 员工排班 导出 */
export const overtimeLedgerExport = async (params: unknown): Promise<BaseAPIResult> => {
  return service.get('/attendance/getWorkOvertimeLedgerExcel', { params })
}
export const overtimeDetailExport = async (params: unknown): Promise<BaseAPIResult> => {
  return service.get('/attendance/getWorkOvertimeLedgerDetailsExcel', { params })
}
/** 加班规则 删除 */
export const overtimeRulesDelete = async (params: { id: string; }): Promise<BaseAPIResult> => {
  return Delete('/attendance//work-overtime-rule/' + params.id)
}

/** 加班规则 新增 编辑 */
export const overtimeRulesPost = async (params: OvertimeRule): Promise<BaseAPIResult<unknown>> => {
  return Post('/attendance/work-overtime-rule', params)
}

export const overtimeRulesDetail = async (params: { id: string; }): Promise<BaseAPIResult<OvertimeRule>> => {
  return Get('/attendance/work-overtime-rule/' + params.id)
}

export interface OvertimeRule {
  id?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 细则
   */
  ruleDetails: OverTimeRuleDetails[];
  /**
   * 加班上限周期(每天、每周、每月)
   */
  upperLimitCycle: string;
  /**
   * 加班上限累计时长(小时)
   */
  upperLimitDuration: number;
}

/**
* 细则
*/
export interface OverTimeRuleDetails {
  /**
   * 下班后多少分钟开始计算
   */
  afterTime: null;
  /**
   * 加班补偿方案
   */
  compensate: string;
  /**
   * 系统自动计算：SYSTEM；人工判定：ARTIFICIAL
   */
  compensationMethod: string;
  /**
   * 加班审批条件：UNLIMITED（无限制）ADVANCE（加班前发起）
   */
  workCondition: string;
  /**
   * 计算方式
   */
  method: string;
  /**
   * 计算调休比例
   */
  proportion: number;
  /**
   * 加班类型(工作日：WORK、休息日：REST、节假日：FESTIVAL：)
   */
  type: string;
  /**
   * 计算单位(半小时、小时)
   */
  units: string;
}
