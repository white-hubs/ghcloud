import { Post, type BaseAPIResult, Get, Delete, service } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './common-type'

/** 排班规则 新增 */
export const schedulingRuleInsert = async (params: SchedulingRule): Promise<BaseAPIResult> => {
  return Post('/attendance/att/scheduling/rule/add', params)
}

/** 排班规则 列表 */
export const schedulingRulePage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/att/scheduling/rule/page', { params })
}

/** 排班规则 详情 */
export const schedulingRuleDetail = async (params: { id: string; }): Promise<BaseAPIResult<SchedulingRule & { id: string; }>> => {
  return Get('/attendance/att/scheduling/rule/detail?id=' + params.id)
}

/** 修改排班规则 */
export const schedulingRuleUpdate = async (params: SchedulingRule & { id: string; }): Promise<BaseAPIResult> => {
  return Post('/attendance/att/scheduling/rule/edit', params)
}

/** 删除排班规则 */
export const schedulingRuleDel = async (params: {
  id: string;
}): Promise<BaseAPIResult> => {
  return Delete('/attendance/att/scheduling/rule/remove?id=' + params.id)
}

/** 员工排班 列表 */
export const staffSchedulingPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/att/scheduling/hand/page', { params })
}

/** 员工排班 手动排版 */
export const staffSchedulingRulehand = async (params: unknown): Promise<BaseAPIResult> => {
  return Post('/attendance/att/scheduling/hand/action', params)
}

/** 员工排班 导出 */
export const staffSchedulingExport = async (params: unknown): Promise<BaseAPIResult> => {
  return service.post('/attendance/att/scheduling/export', params)
}

/** 员工排班 下载模板 */
export const staffSchedulingDownLoad = async (params: unknown): Promise<BaseAPIResult> => {
  return service.post('/attendance/att/scheduling/template/download', params)
}

/** 员工排班 导入 */
export const staffSchedulingImport = async (params: FormData): Promise<unknown> => {
  return Post('/attendance/att/scheduling/template/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/** 员工值班 列表 */
export const staffDutyPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/att/duty/page', { params })
}

/** 员工值班 选择人员回调插入操作 */
export const staffDutyInsert = async (params: unknown): Promise<BaseAPIResult> => {
  return Post('/attendance/att/duty/add/staff', params)
}

/** 员工值班 获取当月已排班的人员集合信息 */
export const getDutyStaffListByMonth = async (params: unknown): Promise<BaseAPIResult<{ id: string; name: string; }[]>> => {
  return Get('/attendance/att/duty/all/staff', { params })
}

/** 员工排班 手动值班 */
export const staffDutyhand = async (params: unknown): Promise<BaseAPIResult> => {
  return Post('/attendance/att/duty/hand', params)
}

/** 员工排班 删除行 */
export const staffDutyRemove = async (params: unknown): Promise<BaseAPIResult> => {
  return Post('/attendance/att/duty/remove/staff', params)
}

/** 员工值班 导出 */
export const staffDutyExport = async (params: unknown): Promise<BaseAPIResult> => {
  return service.post('/attendance/att/duty/export', params)
}

/** 员工值班 下载模板 */
export const staffDutyDownLoad = async (params: unknown): Promise<BaseAPIResult> => {
  return service.post('/attendance/att/duty/template/download', params)
}

/** 员工值班 导入 */
export const staffDutyImport = async (params: FormData): Promise<unknown> => {
  return Post('/attendance/att/duty/template/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export interface SameShift {
  sameShiftNumber: number | null;
  sameShiftType: string[] | null;
}
export interface SchedulingRule {
  continuousDays: string | undefined;
  sameShift: SameShift[] | string;
  intervalHour: string | undefined;
  /**
   * 节假日休息
   */
  legalHolidaysRest: boolean;
  /**
   * 规则名称
   */
  name: string;
  rulesClassesList: RulesClassesList[];
  ways: string;
}

export interface RulesClassesList {
  /**
   * 班次id
   */
  id: string;
  name: string;
  /**
   * 星期
   */
  week: string;
}

export interface Limit {
  continuousDays: number | null;
  intervalHour: number | null;
  // sameShiftNumber: number | null;
  // sameShiftType: string[] | null;
  sameShift: {
    sameShiftNumber: number | null;
    sameShiftType: string[] | null;
  }[];
}
