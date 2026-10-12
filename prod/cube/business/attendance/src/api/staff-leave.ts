import { type BaseAPIResult, Get, Post, Delete, Put, service } from '@ghcloud/ghcloud-business-request'
import type { PageResult, PageLeaveLedgerResult } from './common-type'

/** 请假规则 列表页 */
export const leaveRulesPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/att/holiday/rule/page', { params })
}

/** 请假规则 所有 */
export const leaveRulesList = async (): Promise<BaseAPIResult> => {
  return Get('/attendance/att/holiday/rule/list')
}

/** 获取假期类型 */
export const getHolidayList = async (): Promise<BaseAPIResult> => {
  return Get('/attendance/att/legal/holiday/list')
}

/** 请假规则 详情 */
export const leaveRulesDetail = async (params: { id: string; }): Promise<BaseAPIResult<LeaveRules>> => {
  return Get('/attendance/att/holiday/rule/detail?id=' + params.id)
}

/** 请假规则 新增 */
export const leaveRulesInsert = async (params: LeaveRules): Promise<BaseAPIResult<unknown>> => {
  return Post('/attendance/att/holiday/rule/add', params)
}
/** 请假规则 编辑 */
export const leaveRulesUpdate = async (params: LeaveRules & { id: string; }): Promise<BaseAPIResult<unknown>> => {
  return Put('/attendance/att/holiday/rule/edit', params)
}
/** 请假规则 删除 */
export const leaveRulesDelete = async (params: { id: string; }): Promise<BaseAPIResult<unknown>> => {
  return Delete('/attendance/att/holiday/rule/remove?id=' + params.id)
}

/** 假期余额 列表 */
export const leaveBalancePage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/att/Holiday/balance/page', { params })
}

/** 假期余额 编辑 */
export const leaveBalanceUpdate = async (params: unknown): Promise<BaseAPIResult<unknown>> => {
  return Put('/attendance/att/Holiday/balance/edit', params)
}

/** 假期余额记录 列表 */
export const leaveBalanceDetailPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/att/Holiday/balance/record/page', { params })
}

/** 假期余额 导出 */
export const leaveBalanceExport = async (params: unknown): Promise<BaseAPIResult> => {
  return service.get('/attendance/att/Holiday/balance/export', { params })
}

/** 假期余额 作废 */
export const leaveBalanceCancel = async (params: unknown): Promise<BaseAPIResult> => {
  return Get('/attendance/att/holiday/balance/record/effective', { params })
}

/** 获取员工假期余额 */
export const getStaffLeaveBalance = async (params: { staffId: string; holidayRuleId: number;unit: '小时' | '天'; }): Promise<BaseAPIResult<{ total: number; notLimit: boolean; }>> => {
  return Get('/attendance/att/Holiday/balance/total', { params })
}
/**
 * 获取请假台账
 * @param params
 * @returns
 */
export const getStaffleaveLedger = async (params: unknown): Promise<BaseAPIResult<PageLeaveLedgerResult>> => {
  return Get('/attendance/att/askLeave/ledger/page', { params })
}
/**
 * 导出请假台账
 * @param params
 * @returns
 */
export const exportStaffLeave = async (params: unknown): Promise<BaseAPIResult> => {
  return Post('/attendance/att/askLeave/ledger/export', { params })
}
export interface LeaveRules {
  /**
   * 请假时间计算方式，（工作日/自然日
   */
  calculationWay: string | undefined;
  /**
   * 一天折算小时
   */
  dayOfHour: number | null;
  /**
   * 发放时间，（入职日发放，每年1月1发放
   */
  grantDate: string;
  /**
   * 发放方式，（每年发放
   */
  grantWay: string | undefined;
  /**
   * 最小申请单位
   */
  minAskUnit: number | null;
  /**
   * 名称
   */
  name: string;
  /**
   * 是否限额，(true表示不限额
   */
  notLimit: boolean;
  /**
   * 额度配置，(json
   */
  quota: string | Quota;
  /**
   * 有效期，（json
   */
  validity: string | Validity;
  intoAbsence: boolean;
  holidayType: string | undefined;
}

export interface Quota {
  /**
     * 额度类型（固定额度/按社会工龄/按公司工龄AttHolidayQuotaTypeEnum
     */
  quotaType: 'FIXED' | 'SOCIETY_AGE' | 'COMPANY_AGE';
  /**
     * 固定额度数量
     */
  fixedNumber: number;
  /**
     * 固定额度单位
     */
  fixedUnit: 'DAY' | 'HOUR';
  /**
     * 额度层级
     */
  quotaLevelList: {
    ageYear: number;
    holidayNumber: number;
    unit: 'DAY' | 'HOUR';
  }[];
}

export interface Validity {
  // 长期有效
  longTerm: boolean;
  /**
   * 发放日起 多少自然年有效
   */
  natureYear: number;
  /**
   * 发放日起 多少个单位时间有效
   */
  validityNumber: number;
  /**
   * 有效期单位
   */
  validityUnit: string;
}

/** 获取不限额的假期规则 */
export const getHolidayRuleNotLimit = async (params?: unknown): Promise<BaseAPIResult> => {
  return Get('/attendance/att/holiday/rule/notLimit/list', { params })
}
/** 假期余模板下载 */
export const holidayBalanceDownLoad = async (params: {
  holidayIdList: (string | number)[];
  initTemplate: boolean;
}): Promise<BaseAPIResult> => {
  return service.post('/attendance/att/holiday/balance/template/download', params)
}
/** 假期余额 导入 */
export const holidayBalanceImport = async (params: {
  file: Blob | null;
  init: boolean;
  ruleNames: string;
}): Promise<BaseAPIResult> => {
  return Post('/attendance/att/Holiday/balance/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
