import { Post, type BaseAPIResult, Get, Delete } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './common-type'

/** 考勤组规则 新增 */
export const attendanceGroupInsert = async (params: AttendanceGroup): Promise<BaseAPIResult> => {
  return Post('/attendance/att/group/add', params)
}

/** 考勤组规则 列表 */
export const attendanceGroupPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/att/group/page', { params })
}

/** 考勤组规则 列表 不分页 */
export const attendanceGroupList = async (): Promise<BaseAPIResult<{ id: string; name: string; }[]>> => {
  return Get('/attendance/att/group/list')
}

/** 考勤组规则 详情 */
export const attendanceGroupDetail = async (params: { id: string; }, encryptionPhone = false): Promise<BaseAPIResult<
AttendanceGroup &
{
  id: string;
  overtimeRule: { id: string;name: string; };
  leavePostRule: { id: string;name: string; };
  awayBusinessRule: { id: string;name: string; };
  cardRuleList: { id: string;name: string; }[];
  holidayRuleList: { id: string;name: string; }[];
  groupClassList: { id: string;name: string; }[];
}
>> => {
  return Get('/attendance/att/group/detail?id=' + params.id, {
    headers: {
      encryption: encryptionPhone ? 'true' : 'false'
    },
  })
}

/** 修改考勤组规则 */
export const attendanceGroupUpdate = async (params: AttendanceGroup & { id: string; }): Promise<BaseAPIResult> => {
  return Post('/attendance/att/group/edit', params)
}
/** 考勤组预校验 */
export const attendanceGroupPreChecked = async (params: AttendanceGroup & { id: string | undefined; }): Promise<BaseAPIResult> => {
  return Post('/attendance/att/group/check/staff', params)
}

/** 删除考勤组规则 */
export const attendanceGroupDel = async (params: {
  id: string;
}): Promise<BaseAPIResult> => {
  return Delete('/attendance/att/group/remove?id=' + params.id)
}

export interface AttendanceGroup {
  /**
   * 考勤组规则id 打卡规则id
   */
  clockRuleId: number | undefined;
  /**
   * 适用人员集合
   */
  groupStaffList?: GroupStaffList[];
  /**
   * 名称
   */
  name: string;
  /**
   * 适用范围，PART,ALL
   */
  ranges: string | undefined;
  /**
   * 排班规则id
   */
  schedulingRuleId: number | undefined;
  cardRuleIds: string | undefined;
  groupClassIds: string | undefined;
  overtimeRuleId: string | undefined;
  holidayRuleIds: string | undefined;
  leavePostRuleId: string | undefined;
  awayBusinessRuleId: string | undefined;
}

export interface GroupStaffList {
  deptId: string;
  deptName: string;
  id: string;
  mobile: string;
  name: string;
  organizations: string;
}

export interface StaffList {
  organizations: { id: string; name: string; }[];
  id: string;
  name: string;
  mobile: string;
}
