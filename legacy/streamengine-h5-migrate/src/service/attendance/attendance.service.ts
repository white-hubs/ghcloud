import { FormItemObjectValue } from '../../business/dynamic-table/form-item'
import { LeaveType, LeaveTypeOption } from '../../domain/leave-type'
import { SupplementClassOption } from '../../domain/supplement-class-option'
import { getApiBaseUrL, getAuthHeaders } from '@ghcloud/cube-app-js-sdk'
import { format } from '../../infrastructure/date-util'
import { HTTPClientImpl } from '../../infrastructure/http-client'
import { BaseAPIResult } from '../base-api'
 type Record_Type = any[]
interface AssemblyClassify {
  pages?: number;
  records?: Record_Type;
  total?: number;
}
class AttendanceService {
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL()??'/api',
    headers: getAuthHeaders()
  })

  /**
   * 获取所有工作中人员
   */
  public async getAllWorker (): Promise<FormItemObjectValue[]> {
    const result = await this.client.get<FormItemObjectValue[]>('/attendance/work/users')
    return result
  }
  
  /**
   * 获取所有人员列表
   */
  public async getUserForPage (): Promise<FormItemObjectValue[]> {
    const result = await this.client.get<AssemblyClassify>('ouaa/user-under-tenant/page',{query:{
      pageNumber:1,
      pageSize:999
    }})
    return result.records as FormItemObjectValue[]
  }
  /**
   * 查询班次
   * @param userId 用户 id
   * @param workType 换班类型
   *  
   */
  public async queryWorkClasses (userId: string,workType:string): Promise<FormItemObjectValue[]> {
    const result = await this.client.get<FormItemObjectValue[]>(`/attendance/work/classes?userId=${userId}&workType=${workType}`)
    return result
  }


  /**
   * 查询班次 2.0
   * @param userId 用户 id
   * @param workType 换班类型
   * @param day 换班日期
   */
  public async queryExchaneClasses (userId: string,workType:string,day:string): Promise<FormItemObjectValue[]> {
    const result = await this.client.get<FormItemObjectValue[]>(`/attendance/att/exchange/classes?staffId=${userId}&workType=${workType}&day=${day}`)
    return result
  }

  /**
   * 获取可补卡班次信息
   * @param userId 用户 id
   * @param repairDate 补卡时间 yyyy-mm-dd
   * @returns 可补卡班次信息
   */
  public async querySupplementClasses (userId: string, repairDate: string): Promise<SupplementClassOption[]> {
    const result = await this.client.get<SupplementClassOption[]>(`/attendance/clock/classes/exp?userId=${userId}&repairDate=${repairDate}`)
    return result
  }

  /**
   * 获取可补卡班次信息 考勤2.0
   * @param userId 用户 id
   * @param repairDate 补卡时间 yyyy-mm-dd
   * @returns 可补卡班次信息
   */
  public async getSupplementClasses (userId: string, clockInDate: string): Promise<unknown[]> {
    const result = await this.client.get<unknown[]>(`/attendance/getClockInLogByDate?userId=${userId}&clockInDate=${clockInDate}&abnormal=true`)
    return result
  }

  /**
   * 根据加班类型校验实际加班时间范围
   * @param overtimeType 加班类型
   * @param param1 加班时间范围
   * @returns 校验后的加班时间范围，格式`${start},${end}`
   */
  public async getWorkOvertimePeriod (overtimeType: string, [start, end]: [start: Date, end: Date]): Promise<string> {
    const period = `${format(start)},${format(end)}`
    const result = await this.client.get<{ name: string; }>(`/attendance/work/overtime/period?workOvertimeType=${overtimeType}&period=${period}`)
    return result.name
  }

  /**
   * 计算加班时长
   * @param overtimeType 加班类型
   * @param checkPeriodResult 校验过的加班时间范围
   * @returns 加班时长
   */
  public async calcWorkOvertimeDuration (overtimeType: string, checkPeriodResult: string): Promise<{ name: string; }> {
    const result = await this.client.get<{ name: string; }>(`/attendance/work/overtime/duration?workOvertimeType=${overtimeType}&period=${checkPeriodResult}`)
    return result
  }

  /**
   * 获取所有请假类型
   * @returns 所有请假类型
   */
  public async getLeaveTypes (): Promise<{id:string,name:string}[]> {
    const result = await this.client.get<{id:string,name:string}[]>('/attendance/att/holiday/rule/list')
    return result
  }

  /**
   * 根据请假类型获取配置详情
   * @returns 配置详情
   */
  public async getLeaveTypeOption (leaveType: string): Promise<LeaveTypeOption> {
    const result = await this.client.get<LeaveTypeOption>(`/attendance/detail/type/${leaveType}`)
    return result
  }

  /**
   * @param staffId 员工id
   * @param holidayType 假期类型
   * @returns 假期余额
   */
  public async getVacationBalance (params:{staffId: string, holidayRuleId: string}): Promise<{total:string;notLimit:boolean}> {
    const result = await this.client.get<{total:string;notLimit:boolean}>('/attendance/att/Holiday/balance/total',{query:{...params,unit:"小时"}})
    return result
  }

  /**
   * @param leaveTimeStr 时间
   * @param holidayType 假期类型
   * @returns 假期时长
   */
  public async getVacationDuration (params:{
    businessType:string,
    staffId:string,
    holidayRuleId: string,
    period: string,
  }): Promise<string> {
    const result = await this.client.get<string>('/attendance/att/askLeave/calcDuration', {query:params})
    return result
  }

  /**
   * @param params period时间范围
   * @returns {name:string}
   */
  public async getAttendanceStat (params: { userId: string; period: string; type: string; }): Promise<string> {
    const result = await this.client.get<string>('/attendance/personnel/getClockInDetailsByUserId', { query: params })
    return result
  }

  /**
   * 获取加班补偿
   * @param params
   * @returns
   */
  public async getWorkOvertimeCompensation (params: { processInstanceId: string;workOvertimeType:any }): Promise<Array<{ name: string; id: string; }>> {
    const result = await this.client.get<Array<{ name: string; id: string; }>>('/attendance/work/overtime/compensation', { query: params })
    return result
  }

  // 离岗时间计算
  public async leavePostDuration (params:{
    businessType:string,
    staffId:string,
    postStartTime: string,
    postEndTime: string,
  }): Promise<string> {
    const result = await this.client.get<string>('/attendance/att/leavePost/duration', {query:params})
    return result
  }

    // 加班时间计算
  public async awayBusinessDuration (params:{
    staffId:string,
    startTime: string,
    endTime: string,
  }): Promise<string> {
    const result = await this.client.get<string>('/attendance/att/awayBusiness/duration', {query:params})
    return result
  }
  

  // 检查调换的班次是否符合要求
  public async postClassesChangeCheck (params: { formId: string; formData: string; }): Promise<boolean> {
    // const result = await this.client.post<boolean>('/attendance/work/classes/change/check', params)
    const result = await this.client.post<boolean>('/attendance/att/exchange/check', params)
    return result
  }

  // 补卡检查（检查是否能够提交补卡
  public async postClockRepairCheck (params: { businessType:string,flowData:{ formId: string; formData: string; } }): Promise<boolean> {
    // const result = await this.client.post<boolean>('/attendance/clock/repair/check', params)
    const result = await this.client.post<boolean>('/attendance/att/approve/verification', params)
    return result
  }

  // 考勤组获取枚举数据
  public async getAttendanceGroupEnumerate(params: { type: string })  {
    const result = await this.client.get<Array<{ name: string; value: string; }>>('/attendance/attendance-group/enumerate/list', { query: params })
    return result
  }

  // 考勤统一提交接口
  public async attendanceApprovalSubmit (params: Record<string,any>): Promise<void> {
    await this.client.post('/attendance/att/approval/submit', params)
  }

  // 获取管理请假单列表
  public async getCancelAskFromPage (params: Record<string,any>): Promise<{ records: unknown[]; }> {
    const result = await this.client.get<{ records: unknown[]; }>('/attendance/att/askLeaveFrom/cancelAskFrom/page', { query: params })
    return result
  }
}

export const attendanceService = new AttendanceService()
