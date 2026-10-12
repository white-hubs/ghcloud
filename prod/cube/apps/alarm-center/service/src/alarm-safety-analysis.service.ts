import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { AlarmCorrectRatioVO2, AlarmStatisticsVO, AlarmTrendStatisticsVO, AlarmTypeStatisticsVO, DeviceStatsNumVO, HiddenDangerTypeStatisticsVO, ProjectDataForAnalysisVO2, ProjectTrendStatisticsVO, RiskIndexDetail, SafetyAnalysisAlarmHandlerRank, SafetyAnalysisAlarmRatio, SafetyAnalysisAlarmTotal, SafetyAnalysisAlarmVO1, SafetyAnalysisAlarmVO3 } from './types/safety-analys'

const baseURL = `${BASE_API}/alarm`
const baseURL2 = `${BASE_API}/loose-works`
const baseURL3 = `${BASE_API}/maintain`

export class CubeAlarmSafetyAnalysisService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  // 安全分析-主界面
  public async safetyAnalysisAlarmMain (payload: {
    applicationCode?: string;
    filterStatus?: string;
    period?: string;
    type?: string;
  }): Promise<SafetyAnalysisAlarmVO1> {
    const url = `${baseURL}/safety/analysis/alarm/main/data`
    const resp = await this.gateway.get<LegacyServiceError<SafetyAnalysisAlarmVO1>>({
      url,
      payload
    })
    return resp.data || resp
  }

  // 安全分析-安全报警数据
  public async safetyAnalysisAlarmTotal (payload: {
    applicationCode?: string;
    period?: string;
    type?: string;
  }): Promise<SafetyAnalysisAlarmTotal> {
    const url = `${baseURL}/safety/analysis/alarm/total/num`
    const resp = await this.gateway.get<LegacyServiceError<SafetyAnalysisAlarmTotal>>({
      url,
      payload
    })
    return resp.data || resp
  }

  // 安全分析-报警等级占比
  public async safetyAnalysisAlarmLevelRatio (payload: {
    applicationCode?: string;
    period?: string;
    type?: string;
  }): Promise<SafetyAnalysisAlarmRatio[]> {
    const url = `${baseURL}/safety/analysis/alarm/level/ratio`
    const resp = await this.gateway.get<LegacyServiceError<SafetyAnalysisAlarmRatio[]>>({
      url,
      payload
    })
    return resp.data || resp
  }

  // 安全分析-报警事件占比
  public async safetyAnalysisAlarmEventRatio (payload: {
    applicationCode?: string;
    period?: string;
    type?: string;
  }): Promise<SafetyAnalysisAlarmRatio[]> {
    const url = `${baseURL}/safety/analysis/alarm/event/ratio`
    const resp = await this.gateway.get<LegacyServiceError<SafetyAnalysisAlarmRatio[]>>({
      url,
      payload
    })
    return resp.data || resp
  }

  // 安全分析-隐患占比
  public async getHiddenTypeStatistics (payload: {
    period?: string;
    type?: string;
  }): Promise<HiddenDangerTypeStatisticsVO> {
    const url = `${baseURL3}/hidden/type/statistics`
    const resp = await this.gateway.get<LegacyServiceError<HiddenDangerTypeStatisticsVO>>({
      url,
      payload
    })
    return resp.data || resp
  }

  // 安全分析-报警处理排名
  public async safetyAnalysisAlarmHandlerRank (payload: {
    applicationCode?: string;
    period?: string;
    type?: string;
  }): Promise<SafetyAnalysisAlarmHandlerRank> {
    const url = `${baseURL}/safety/analysis/alarm/handler/rank`
    const resp = await this.gateway.get<LegacyServiceError<SafetyAnalysisAlarmHandlerRank>>({
      url,
      payload
    })
    return resp.data || resp
  }

  // 安全分析-消防设备建档情况
  public async safetyAnalysisDeviceStatus (payload: {
    applicationCode?: string;
    period?: string;
    type?: string;
  }): Promise<DeviceStatsNumVO> {
    const url = `${baseURL}/safety/analysis/device/status/card`
    const resp = await this.gateway.get<LegacyServiceError<DeviceStatsNumVO>>({
      url,
      payload
    })
    return resp.data || resp
  }

  // 安全分析-报警趋势统计
  public async alarmTrendAnalysis (payload: {
    applicationCode?: string;
    period?: string;
    type?: string;
  }): Promise<AlarmTrendStatisticsVO[]> {
    const url = `${baseURL}/alarm-statistics/trend`
    const resp = await this.gateway.get<LegacyServiceError<AlarmTrendStatisticsVO[]>>({
      url,
      payload
    })
    return resp.data || resp
  }

  // 安全分析-报警事件正确率
  public async safetyAnalysisAlarmCorrectRatio (payload: {
    applicationCode?: string;
    period?: string;
    type?: string;
  }): Promise<AlarmCorrectRatioVO2[]> {
    const url = `${baseURL}/safety/analysis/alarm/correct/ratio`
    const resp = await this.gateway.get<LegacyServiceError<AlarmCorrectRatioVO2[]>>({
      url,
      payload
    })
    return resp.data || resp
  }

  // 安全分析-安全工作情况
  public async safetyWorkStatus (payload: {
    applicationCode?: string;
    period?: string;
    type?: string;
    filterStatus?: string;
  }): Promise<SafetyAnalysisAlarmVO3> {
    const url = `${baseURL}/safety/analysis/alarm/safety/work/status`
    const resp = await this.gateway.get<LegacyServiceError<SafetyAnalysisAlarmVO3>>({
      url,
      payload
    })
    return resp.data || resp
  }

  // 安全分析-小散工程数量和环比统计
  public async getProjectRatioSafety (payload: {
    period?: string;
    type?: string;
  }): Promise<ProjectDataForAnalysisVO2> {
    const url = `${baseURL2}/project/ratio/safety/analysis`
    const resp = await this.gateway.get<LegacyServiceError<ProjectDataForAnalysisVO2>>({
      url,
      payload
    })
    return resp.data || resp
  }

  // 安全分析-小散工程趋势
  public async getProjectTrendSafety (payload: {
    period?: string;
    type?: string;
  }): Promise<ProjectTrendStatisticsVO[]> {
    const url = `${baseURL2}/project/trend/safety/analysis`
    const resp = await this.gateway.get<LegacyServiceError<ProjectTrendStatisticsVO[]>>({
      url,
      payload
    })
    return resp.data || resp
  }

  // 安全分析-报警类型排名统计
  public async alarmStatisticsTypeRank (payload: {
    alarmLevelCode?: string;
    alarmLevelCodeList?: string[];
    alarmLevelId?: number;
    alarmStatus?: string;
    alarmTargetCode?: string;
    alarmTargetTypeId?: string;
    alarmTypeIds?: string[];
    area?: string;
    areaId?: number;
    areaSequences?: string[];
    businessType?: string;
    departmentIds?: string[];
    deviceIds?: string[];
    deviceTypes?: string[];
    eventIds?: string[];
    filterScope?: string;
    pageNumber?: number;
    pageSize?: number;
    applicationCode?: string;
    applicationCodeList?: string[];
    period?: string;
    type?: string;
  }): Promise<AlarmTypeStatisticsVO[]> {
    const url = `${baseURL}/alarm-statistics/type-rank`
    const resp = await this.gateway.get<LegacyServiceError<AlarmTypeStatisticsVO[]>>({
      url,
      payload
    })
    return resp.data || resp
  }

  // 安全分析-报警统计
  public async alarmStatistics (payload: {
    alarmLevelCode?: string;
    alarmLevelCodeList?: string[];
    alarmLevelId?: number;
    alarmStatus?: string;
    alarmTargetCode?: string;
    alarmTargetTypeId?: string;
    alarmTypeIds?: string[];
    applicationCode?: string;
    applicationCodeList?: string[];
    area?: string;
    areaId?: number;
    areaSequences?: string[];
    businessType?: string;
    departmentIds?: string[];
    deviceIds?: string[];
    deviceTypes?: string[];
    eventIds?: string[];
    filterScope?: string;
    pageNumber?: number;
    pageSize?: number;
    period?: string;
    type?: string;
    userId?: number | string;
    userIds?: string[];
  }): Promise<AlarmStatisticsVO> {
    const url = `${baseURL}/alarm-statistics`
    const resp = await this.gateway.get<LegacyServiceError<AlarmStatisticsVO>>({
      url,
      payload
    })
    return resp.data || resp
  }

  // 安全分析-风险指标详情
  public async getRiskIndexDetail (payload: {
    applicationCode?: string;
    period?: string;
    type?: string;
  }): Promise<RiskIndexDetail> {
    const url = `${baseURL}/risk-index/detail`
    const resp = await this.gateway.get<LegacyServiceError<RiskIndexDetail>>({
      url,
      payload
    })
    return resp.data || resp
  }
}
