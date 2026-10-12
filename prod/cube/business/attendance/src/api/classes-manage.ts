import { Post, type BaseAPIResult, Get, Delete } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './common-type'
import type { ClassesType } from '@/types/classes'

/** 班次 新增 */
export const classesInsert = async (params: Classes): Promise<BaseAPIResult> => {
  return Post('/attendance/att/classes/add', params)
}

/** 班次 列表 */
export const classesPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/att/classes/page', { params })
}
/** 班次 列表 不分页 */
export const classesList = async (): Promise<BaseAPIResult<{ id: string; name: string;classesType: ClassesType; }[]>> => {
  return Get('/attendance/att/classes/list')
}

export const classesPageWithDept = async (params: Record<string, unknown>): Promise<BaseAPIResult<PageResult>> => {
  params.deptWhere = true
  return Get('/attendance/att/classes/page', { params })
}

/** 班次 详情 */
export const classesDetail = async (params: { id: string; }): Promise<BaseAPIResult<Classes & { id: string; }>> => {
  return Get('/attendance/att/classes/detail?id=' + params.id)
}

/** 修改班次 */
export const classesUpdate = async (params: Classes & { id: string; }): Promise<BaseAPIResult> => {
  return Post('/attendance/att/classes/edit', params)
}

/** 删除班次 */
export const classesDel = async (params: {
  id: string;
}): Promise<BaseAPIResult> => {
  return Delete('/attendance/att/classes/remove?id=' + params.id)
}
/** 删除班次预校验 */
export const classesDelCheck = async (params: {
  id: string;
}): Promise<BaseAPIResult> => {
  return Get('/attendance/att/classes/checkGroupUse?id=' + params.id)
}

export interface Classes {
  /**
   * 班次类型
   */
  classesType: string | undefined;
  /**
   * 建议应用范围，部门id，逗号隔开，全部时为0
   */
  deptIds?: string | string[];
  /**
   * 下班结束打卡时间
   */
  endClockAfterTime: string;
  /**
   * 下班开始打卡时间
   */
  endClockBeforeTime: string;
  /**
   * 是否跨天班次
   */
  endTimeIsMorrow: boolean;
  /**
   * 下班时间
   */
  endWorkTime: string;
  /**
   * 班次名称
   */
  name: string;
  /**
   * 简称
   */
  nickName: string;
  /**
   * 休息结束时间
   */
  restEndTime: string;
  /**
   * 休息开始时间
   */
  restStartTime: string;
  /**
   * 上班结束打卡时间
   */
  startClockAfterTime: string;
  /**
   * 上班开始打卡时间
   */
  startClockBeforeTime: string;
  /**
   * 上班时间
   */
  startWorkTime: string;
}
