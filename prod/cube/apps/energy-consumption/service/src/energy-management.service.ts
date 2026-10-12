import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { MeterDeviceDetail, MeterReadLog, PageResult } from './types'

const baseURL = `${BASE_API}/energymanagement`
export interface Children {
  id: string;
  parentId?: string;
  level: number;
  children: Children[];
  projectName: string;
}

export interface ProjectTreeSpecial {
  id?: string;
  parentId?: string;
  level?: number;
  children: Children[];
  projectName: string;
}
export interface AlarmRecord {
  /**
   * 报警确认时间
   */
  alarmConfirmedBy: string;
  /**
   * 报警确认人员名称
   */
  alarmConfirmedName: string;
  /**
   * 报警确认结果
   */
  alarmConfirmedResult: string;
  /**
   * 报警确认结果名称
   */
  alarmConfirmedTime: string;
  /**
   * 可能是报警事件或者能耗异常类型（用于指定此次报警是什么引起的）
   */
  alarmEvent: string;
  /**
   * 报警事件名称
   */
  alarmEventName: string;
  /**
   * 应用主键
   */
  alarmHandlerBy: number;
  /**
   * 应用编号
   */
  alarmHandlerName: string;
  /**
   * 报警处理结果
   */
  alarmHandlerResult: 'ALARM_ACTUAL' | 'ALARM_IMPRACTICAL';
  /**
   * 报警处理结果
   */
  alarmHandlerResultName: string;
  /**
   * 报警处理结果描述
   */
  alarmHandlerResultRemark: string;
  /**
   * 应用名称
   */
  alarmHandlerTime: string;
  /**
   * 报警超时状态
   */
  alarmHandlerTimeoutStatus: 'NORMAL' | 'ALARM_IMPRACTICAL';
  /**
   * 级别编号
   */
  alarmLevelCode: string;
  /**
   * 级别主键
   */
  alarmLevelId: number;
  /**
   * 级别名称
   */
  alarmLevelName: string;
  /**
   * 级别序号
   */
  alarmLevelSort: number;
  /**
   * 报警状态
   */
  alarmStatus: string;
  /**
   * 报警状态名称
   */
  alarmStatusName: string;
  alarmTargetAddress: string;
  /**
   * 对象编号
   */
  alarmTargetCode: string;
  /**
   * 对象主键
   */
  alarmTargetKey: number;
  /**
   * 报警对象经纬度
   */
  alarmTargetLongitude: string;
  /**
   * 对象名称
   */
  alarmTargetName: string;
  /**
   * 对象类型主键
   */
  alarmTargetTypeId: number;
  /**
   * 对象类型主键
   */
  alarmTargetTypeName: string;
  /**
   * 报警阀值
   */
  alarmThreshold: string;
  /**
   * 报警发生时间
   */
  alarmTime: string;
  /**
   * 类型编号
   */
  alarmTypeCode: string;
  /**
   * 类型主键
   */
  alarmTypeId: number;
  /**
   * 类型名称
   */
  alarmTypeName: string;
  /**
   * 应用编号
   */
  applicationCode: string;
  /**
   * 应用名称
   */
  applicationName: string;
  /**
   * 报警区域
   */
  area: string;
  /**
   * 报警区域名称
   */
  areaName: string;
  /**
   * 业务主键
   */
  businessKey: number;
  /**
   * 业务类型
   */
  businessType: string;
  /**
   * 编号
   */
  code: string;
  /**
   * 预计处理时间
   */
  estimateHandlerTime: string;
  id: string;
  /**
   * 是否配备超时
   */
  timeoutEquipped: string;
  /**
   * 超时处理时间
   */
  timeoutProcessTime: string;
  /**
   * 超时处理时间
   */
  timeoutProcessTimes: string;
  /**
   * 超时处理时间名
   */
  timeoutProcessTimesName: string;
  /**
   * 超时处理时间单位
   */
  timeoutProcessTimesUnit: string;
  /**
   * 跳转地址
   */
  url: string;
}
export interface UsageStatCarbonDmy {
  instrumentType: string;
  dayValue: number;
  monthValue: number;
  yearValue: number;
  qoqDayValue: number;
  qoqMonthValue: number;
  qoqYearValue: number;
  qoqDayValueRate: number;
  qoqMonthValueRate: number;
  qoqYearValueRate: number;
}
export interface Data {
  name: string;
}

export interface Link {
  source: string;
  value: string;
  target: string;
}

export interface ProjectAreaStatFlow {
  data: Data[];
  links: Link[];
}
export interface UsageDcStatTrend {
  time: string;
  name: string;
  value: number;
  dcValue: number;
  zhValue: number;
}
export interface CollectConfigList {
  id: string;
  categoryCode: string;
  categoryName: string;
  collectType: string;
  collectOn: boolean;
  custCode: string;
  fuelCode: string;
  fuelName: string;
  unit: string;
}

export interface UsageDcAtaTrend {
  time: string;
  name: string;
  value: number;
  dcValue: number;
  zhValue: number;
}
export interface UsageStatCategoryAll {
  instrumentType: string;
  instrumentTypeName: string;
  value: number;
  qoqValue: number;
  qoqValueRate: number;
}
/** 能耗管理模块 */
export class CubeEnergyManagementService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 能耗分类配置列表 */
  public async collectConfigList (): Promise<CollectConfigList[]> {
    const url = `${baseURL}/energy-collect-config/list`
    const resp = await this.gateway.get<LegacyServiceError<CollectConfigList[]>>({ url })
    return resp.data||resp
  }

  // 报警趋势分析统计
  public async alarmTrendAnalysis (): Promise<unknown> {
    const url = '/api/safety-management/safety-alarm-statistics/trend-analysis'
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
    })
    return resp.data||resp
  }

  // 计量设备分页
  public async getMeterDevicePage (payload: {
    deviceArea?: string;
    deviceAreaId?: string;
    instrumentType?: string;
    keyword?: string;
  }): Promise<PageResult<unknown>> {
    const url = `${baseURL}/meter-device/page`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<unknown>>>({
      url,
      payload
    })
    return resp.data||resp
  }

  // 计量设备详情
  public async getMeterDeviceDetail (payload: {
    id: string;
  }): Promise<MeterDeviceDetail> {
    const url = `${baseURL}/meter-device/detail/${payload.id}`
    const resp = await this.gateway.get<LegacyServiceError<MeterDeviceDetail>>({
      url,
      payload
    })
    return resp.data||resp
  }

  // 抄表记录分页查询
  public async getMeterReadLogPage (payload: {
    deviceIds?: string;
    deviceKeyword?: string;
    pageNumber?: number;
    pageSize?: number;
    period?: string;
  }): Promise<PageResult<MeterReadLog>> {
    const url = `${baseURL}/meter-read-log/page`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<MeterReadLog>>>({
      url,
      payload
    })
    return resp.data||resp
  }

  // 查询换表记录
  public async getMeterDeviceChangeLogPage (payload: {
    deviceId?: string;
  }): Promise<PageResult<unknown>> {
    const url = `${baseURL}/meter-device-change-log/page`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<unknown>>>({
      url,
      payload
    })
    return resp.data||resp
  }

  // 能耗分项列表
  public async projectTreeSpecial (payload: {
    instrumentType?: string;
  }): Promise<ProjectTreeSpecial[]> {
    const url = `${baseURL}/energy-project/tree/special`
    const resp = await this.gateway.get<LegacyServiceError<ProjectTreeSpecial[]>>({
      url,
      payload
    })
    return resp.data||resp
  }

  // 能耗分类统计用量（碳排和综合）
  public async usageStatCategoryAll (payload: {
    period?: string;
    type?: string;
  }): Promise<UsageStatCategoryAll[]> {
    const url = `${baseURL}/energy-daily-usage/stat/category/all`
    const resp = await this.gateway.get<LegacyServiceError<UsageStatCategoryAll[]>>({
      url,
      payload
    })
    return resp.data||resp
  }

  // 碳排/综合趋势统计（按时间）
  public async usageDcAtaTrend (payload: {
    period?: string;
    type?: string;
  }): Promise<UsageDcAtaTrend[]> {
    const url = `${baseURL}/energy-daily-usage/dc/stat/trend`
    const resp = await this.gateway.get<LegacyServiceError<UsageDcAtaTrend[]>>({
      url,
      payload
    })
    return resp.data||resp
  }

  // 能耗走向
  public async projectAreaStatFlow (payload: {
    period?: string;
    projectCategory?: string;
    type?: string;
  }): Promise<ProjectAreaStatFlow> {
    const url = `${baseURL}/energy-daily-usage-project/area/stat/flow`
    const resp = await this.gateway.get<LegacyServiceError<ProjectAreaStatFlow>>({
      url,
      payload
    })
    return resp.data||resp
  }

  // 用能趋势
  public async usageDcStatTrend (payload: {
    period?: string;
    instrumentType?: string;
    type?: string;
  }): Promise<UsageDcStatTrend[]> {
    const url = `${baseURL}/energy-daily-usage/dc/stat/trend`
    const resp = await this.gateway.get<LegacyServiceError<UsageDcStatTrend[]>>({
      url,
      payload
    })
    return resp.data||resp
  }

  // 区域用能
  public async projectStatCategory (payload: {
    period?: string;
    instrumentType?: string;
    projectCategory?: string;
    type?: string;
  }): Promise<UsageDcStatTrend[]> {
    const url = `${baseURL}/energy-daily-usage/project/stat/category`
    const resp = await this.gateway.get<LegacyServiceError<UsageDcStatTrend[]>>({
      url,
      payload
    })
    return resp.data||resp
  }

  // 日月年碳排/综合能耗统计
  public async usageStatCarbonDmy (payload: {
    exportType?: string;
  }): Promise<UsageStatCarbonDmy> {
    const url = `${baseURL}/energy-daily-usage/stat/carbon/dmy`
    const resp = await this.gateway.get<LegacyServiceError<UsageStatCarbonDmy>>({
      url,
      payload
    })
    return resp.data||resp
  }

  // 碳排放分类统计
  public async dcStatTimeCategory (payload: {
    period?: string;
    type?: string;
  }): Promise<UsageDcStatTrend[]> {
    const url = `${baseURL}/energy-daily-usage/dc/stat/time/category`
    const resp = await this.gateway.get<LegacyServiceError<UsageDcStatTrend[]>>({
      url,
      payload
    })
    return resp.data||resp
  }

  // 碳排趋势
  public async dailySummaryTrend (payload: {
    period?: string;
    type?: string;
  }): Promise<UsageDcStatTrend[]> {
    const url = `${baseURL}/energy-daily-summary/trend`
    const resp = await this.gateway.get<LegacyServiceError<UsageDcStatTrend[]>>({
      url,
      payload
    })
    return resp.data||resp
  }

  // 日月年统计用量
  public async EnergySituation (payload: {
    instrumentType?: string;
  }): Promise<UsageStatCarbonDmy> {
    const url = `${baseURL}/energy-daily-usage/stat/dmy`
    const resp = await this.gateway.get<LegacyServiceError<UsageStatCarbonDmy>>({
      url,
      payload
    })
    return resp.data||resp
  }

  // 日月年统计用量
  public async usageTrend (payload: {
    instrumentType?: string;
    projectCategory: string;
  }): Promise<UsageDcStatTrend[]> {
    const url = `${baseURL}/energy-daily-usage/project/stat/trend`
    const resp = await this.gateway.get<LegacyServiceError<UsageDcStatTrend[]>>({
      url,
      payload
    })
    return resp.data||resp
  }

  // 能耗分项分布统计
  public async UsageSubItemTrend (payload: {
    instrumentType?: string;
    period?: string;
    type?: string;
  }): Promise<UsageDcStatTrend[]> {
    const url = `${baseURL}/energy-daily-usage/project/stat/time/category`
    const resp = await this.gateway.get<LegacyServiceError<UsageDcStatTrend[]>>({
      url,
      payload
    })
    return resp.data||resp
  }

  // 区域分项树
  public async AreaProjectTree (payload: {
    instrumentType?: string;
  }): Promise<UsageDcStatTrend[]> {
    const url = `${baseURL}/area-project/tree`
    const resp = await this.gateway.get<LegacyServiceError<UsageDcStatTrend[]>>({
      url,
      payload
    })
    return resp.data||resp
  }

  /** 报警记录分页 */
  public async getAlarmRecordsPage (payload: {
    /**
       * 报警事件
       */
    alarmEvent?: string;
    /**
           * 事件分类信息
           */
    alarmEventTypeId?: string;
    /**
           * 处理结果,实报:ALARM_ACTUAL,误报:ALARM_IMPRACTICAL
           */
    alarmHandlerResult?: string;
    /**
           * 报警超时状态 超时:TIMED_OUT,正常:NORMAL
           */
    alarmHandlerTimeoutStatus?: string;
    /**
           * 报警级别编号
           */
    alarmLevelCode?: string;
    /**
           * 报警级别主键
           */
    alarmLevelId?: number;
    /**
           *
           * 确认状态待确认:ALARM_UN_CONFIRMED,处理中:ALARM_PROGRESS_CONFIRMED,已挂起:ALARM_SUSPEND,已处理:ALARM_HANDLER
           */
    alarmStatus?: string;
    /**
           * 报警对象类型主键
           */
    alarmTargetTypeId?: number;
    /**
           * 报警类型主键
           */
    alarmTypeId?: number;
    /**
           * 应用编号
           */
    applicationCode?: string;
    /**
           * 区域主键
           */
    areaId?: string;
    /**
           * 报警区域
           */
    areaIds?: string;
    /**
           * 业务类型,设备报警:DEVICE_ALARM,预案中心报警:EMERGENCY_CENTER
           */
    businessType?: string;
    /**
           * 部门主键
           */
    departmentId?: string;
    /**
           * 设备主键集合
           */
    deviceIds?: string[];
    /**
           * 设备标签集合
           */
    deviceTags?: string;
    /**
           * 关键字
           */
    keyword?: string;
    pageNumber: number;
    pageSize: number;
    /**
           * 报警时间范围
           */
    period?: string;
    /**
           * 场景id
           */
    sceneType?: string;
    /**
           * 用户主键
           */
    userId?: string;
    /**
           * 用户负责的报警,true:只查询负责的报警数(不包含待接收),false:查询用户所有的报警数
           */
    userResponsible?: string;
  }): Promise<{ total: number; records: AlarmRecord[]; }> {
    const url = '/api/alarm/alarm-records'
    const resp = await this.gateway.get<LegacyServiceError<{ total: number; records: AlarmRecord[]; }>>({
      url, payload
    })
    return resp.data||resp
  }

  /** 报警状态分组统计 */
  public async alarmSummaryStatGroup (payload: {
    applicationCode?: string;
    alarmLevelId?: string;
    period?: string;
  }): Promise<{
      'alarmStatus': 'string';
      'alarmStatusName': 'string';
      'alarmNum': number;
    }[]> {
    const url = '/api/alarm/alarm-statistics/status-group'
    const resp = await this.gateway.get<LegacyServiceError<{
      'alarmStatus': 'string';
      'alarmStatusName': 'string';
      'alarmNum': number;
    }[]>>({
      url,
      payload
    })
    return resp.data||resp
  }
}
