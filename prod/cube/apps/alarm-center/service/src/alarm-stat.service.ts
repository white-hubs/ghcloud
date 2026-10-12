import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API, toDateUnit, type CubeStatPeriodParams, PeriodStatTypeEnum } from '@ghcloud/cube-protocol'
import { type DateUnit, DateUtils } from '@ghcloud/epp'
import type { AlarmApplicationStatGroup, AlarmStatusTotalPageVO, PageResult } from './type'

const baseURL = `${BASE_API}/alarm`

function formatToDay (date: Date, unit: DateUnit): string {
  return DateUtils.toTimeBoundaryPeriodOf(date, unit).format('YYYY-MM-DD')
}

export interface AlarmStatisticsGroup {
  'alarmStatus': 'string';
  'alarmStatusName': 'string';
  'alarmNum': number;
}

export class CubeAlarmStatService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  public async alarmSummaryStat (query: CubeStatPeriodParams): Promise<Record<string, unknown>> {
    const url = `${baseURL}/alarm-statistics`
    const { type = PeriodStatTypeEnum.TODAY } = query
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>>>({
      url,
      payload: {
        period: formatToDay(query.time, toDateUnit(type))
      }
    })
    return resp.data || resp
  }

  /** 报警状态分组统计 */
  public async alarmSummaryStatGroup (payload: {
    applicationCode?: string;
    alarmLevelId?: string;
    period?: string;
    deviceIds?: string[];
  }): Promise<AlarmStatisticsGroup[]> {
    const url = `${baseURL}/alarm-statistics/status-group`
    const resp = await this.gateway.get<LegacyServiceError<AlarmStatisticsGroup[]>>({
      url,
      payload
    })
    return resp.data || resp
  }

  /** 报警应用分组数量统计 */
  public async alarmApplicationStatGroup (payload: {
    period?: string;
    type?: string;
  }): Promise<AlarmApplicationStatGroup[]> {
    const url = `${baseURL}/alarm-statistics/application-group-statistics`
    const resp = await this.gateway.get<LegacyServiceError<AlarmApplicationStatGroup[]>>({
      url,
      payload
    })
    return resp.data || resp
  }

  public async alarmSummaryStatByTypeRank (query: CubeStatPeriodParams): Promise<Record<string, unknown>> {
    const url = `${baseURL}/alarm-statistics/type-rank`
    const { type = PeriodStatTypeEnum.TODAY } = query
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>>>({
      url,
      payload: {
        period: formatToDay(query.time, toDateUnit(type))
      }
    })
    return resp.data || resp
  }

  public async alarmTrendStat (query: CubeStatPeriodParams): Promise<Record<string, unknown>> {
    const url = `${baseURL}/alarm-statistics/trend`
    const { type = PeriodStatTypeEnum.TODAY } = query
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>>>({
      url,
      payload: {
        period: formatToDay(query.time, toDateUnit(type)),
        type: query.type
      }
    })
    return resp.data || resp
  }

  /** 按用户分组统计报警状态分页列表 */
  public async alarmUserPage (payload: {
    alarmEventTypeCode?: string;
    applicationCode?: string;
    departmentId?: number | null;
    departmentIds?: string[];
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
    period?: string;
    userIds?: string[];
  }): Promise<PageResult<AlarmStatusTotalPageVO>> {
    const url = `${baseURL}/alarm-statistics/user-status-page`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<AlarmStatusTotalPageVO>>>({
      url,
      payload
    })
    return resp.data || resp
  }

  /** 安全报表-报警统计 */
  public async alarmSafetyReportPage (payload: {
    alarmEventTypeCode?: string;
    applicationCode?: string;
    departmentId?: number;
    departmentIds?: string[];
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
    userIds?: string[];
    period?: string;
  }): Promise<PageResult<AlarmStatusTotalPageVO>> {
    const url = `${baseURL}/alarm/record/safety-report`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<AlarmStatusTotalPageVO>>>({
      url,
      payload
    })
    return resp.data || resp
  }

  /** 安全报表-部门统计 */
  public async alarmSafetyReportDepartmentPage (payload: {
    alarmEventTypeCode?: string;
    applicationCode?: string;
    departmentId?: number;
    departmentIds?: string[];
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
    period?: string;
    userIds?: string[];
  }): Promise<PageResult<AlarmStatusTotalPageVO>> {
    const url = `${baseURL}/alarm/record/safety-report/department`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<AlarmStatusTotalPageVO>>>({
      url,
      payload
    })
    return resp.data || resp
  }

  /** 按用户分组统计报警状态分页列表 导出 */
  public async alarmUserPageExport (payload: {
    alarmEventTypeCode?: null | string;
    applicationCode?: null | string;
    departmentId?: number | null;
    departmentIds?: number[] | null;
    keyword?: null | string;
    pageNumber?: number | null;
    pageSize?: number | null;
    period?: string | {
      begin: string;
      end: string;
    };
    userIds?: number[] | null;
  }): Promise<Blob> {
    const url = `${baseURL}/alarm-statistics/user-status/list/export`
    const resp = await this.gateway.customBlob({
      url,
      method: 'POST',
      payload
    })
    return resp
  }

  /** 安全报表-报警统计-导出 */
  public async alarmSafetyReportPageExport (payload: {
    alarmEventTypeCode?: null | string;
    applicationCode?: null | string;
    departmentId?: number | null;
    departmentIds?: number[] | null;
    keyword?: null | string;
    pageNumber?: number | null;
    pageSize?: number | null;
    period?: string | {
      begin: string;
      end: string;
    };
    userIds?: number[] | null;
  }): Promise<Blob> {
    const url = `${baseURL}/alarm/record/safety-report/export`
    const resp = await this.gateway.customBlob({
      url,
      method: 'POST',
      payload
    })
    return resp
  }

  /** 安全报表-部门统计-导出 */
  public async alarmDepartmentPageExport (payload: {
    alarmEventTypeCode?: null | string;
    applicationCode?: null | string;
    departmentId?: number | null;
    departmentIds?: number[] | null;
    keyword?: null | string;
    pageNumber?: number | null;
    pageSize?: number | null;
    period?: string | {
      begin: string;
      end: string;
    };
    userIds?: number[] | null;
  }): Promise<Blob> {
    const url = `${baseURL}/alarm/record/safety-report/department/export`
    const resp = await this.gateway.customBlob({
      url,
      method: 'POST',
      payload
    })
    return resp
  }

  /** 报警记录 导出 */
  public async alarmRecordExport (payload: {
    alarmEvent?: string;
    alarmEventName?: string;
    alarmStatus?: 'ALARM_HANDLER' | 'ALARM_PROGRESS_CONFIRMED' | 'ALARM_SUSPEND' | 'ALARM_UN_CONFIRMED';
    keyword?: string;
    period?: string | {
      begin: string;
      end: string;
    };
    userId?: string;
  }): Promise<Blob> {
    const url = `${baseURL}/alarm-records/export`
    const resp = await this.gateway.customBlob({
      url,
      method: 'POST',
      payload
    })
    return resp
  }
}
