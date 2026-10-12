import { PZBaseCardService } from '../base-card-service'

/**
 * @description 彭州能耗卡片服务
 */
export class PZEnergyService extends PZBaseCardService {

  /**
   * @description 能耗设备数量
   */
  public async getEnergyDeviceCount (): Promise<{
    "equipmentType": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/consumption/area/equipmentCount')
  }
  /**
   * @description 按照区域统计
   */
  public async getEnergyByArea (): Promise<{
    "areaName": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/consumption/area/areaStats')
  }
  /**
   * @description 能耗报警
   */
  public async getEnergyAlarm (): Promise<{
    "totalCount": number;
    "records": {
      "recordTime": number;
      "alarmCount": number;
    }[];
  }> {
    return this.get('/api/pengzhou/consumption/area/alarm')
  }

  /**
   * @description 能耗趋势走向
   */
  public async getEnergyTrend (): Promise<{
    "recordDate": string;
    "trendValue": number;
  }[]> {
    return this.get('/api/pengzhou/consumption/area/trend')
  }
  /**
   * @description 区域能耗环比统计
   */
  public async getEnergyAreaRatio (): Promise<{
    "yearOnYear": {
      "areaName": string;
      "count": number;
    }[];
    "chainRatio": {
      "areaName": string;
      "count": number;
    }[];
  }> {
    return this.get('/api/pengzhou/consumption/area/chainRatio')
  }
  /**
   * @description 用水总览
   */
  public async getWaterOverview (type: string): Promise<{
    "total": number;
    "chainRatio": number;
    "yearOnYear": number;
  }> {
    return this.get('/api/pengzhou/consumption/type/water/overview', { type })
  }

  /**
   * @description 用水趋势分析
   */
  public async getWaterTrend (type: string): Promise<{
    "desc": string;
    "value": number;
  }[]> {
    return this.get('/api/pengzhou/consumption/type/water/trend', { type })
  }
  /**
   * @description 用电总览
   */
  public async getElectricityOverview (type: string): Promise<{
    "total": number;
    "chainRatio": number;
    "yearOnYear": number;
  }> {
    return this.get('/api/pengzhou/consumption/type/electric/overview', { type })
  }
  /**
   * @description 用电趋势分析
   */
  public async getElectricityTrend (type: string): Promise<{
    "desc": string;
    "value": number;
  }[]> {
    return this.get('/api/pengzhou/consumption/type/electric/trend', { type })
  }
  /**
   * @description 用气总览
   */
  public async getGasOverview (type: string): Promise<{
    "total": number;
    "chainRatio": number;
    "yearOnYear": number;
  }> {
    return this.get('/api/pengzhou/consumption/type/gas/overview', { type })
  }
  /**
   * @description 用气趋势分析
   */
  public async getGasTrend (type: string): Promise<{
    "desc": string;
    "value": number;
  }[]>{
    return this.get('/api/pengzhou/consumption/type/gas/trend', { type })
  }
  /**
   * @description 设备读数分析
   */
  public async getDeviceReading (type: 'WATER' | 'ELECTRIC' | 'GAS'): Promise<{
    "deviceName": string;
    "minValue": number;
    "maxValue": number;
    "currentValue": number;
  }[]> {
    return this.get(`/api/pengzhou/consumption/device/readingAnalysis/${type}`)
  }
  /**
   * @description 设备用量统计分析
   */
  public async getDeviceUsageStatistics (type: 'WATER' | 'ELECTRIC' | 'GAS'): Promise<{
    "deviceName": string;
    "deviceUsage": number;
  }[]> {
    return this.get(`/api/pengzhou/consumption/device/usageAnalysis/${type}`)
  }

  /**
   * @description 上期用量分析
   */
  public async getLastPeriodUsage (type: 'WATER' | 'ELECTRIC' | 'GAS'): Promise<{
    "deviceName": string;
    "lastPeriodUsage": number;
  }[]> {
    return this.get(`/api/pengzhou/consumption/device/lastPeriodUsageAnalysis/${type}`)
  }
  /**
   * @description 设备区域统分析
   */
  public async getDeviceAreaStatistics (type: 'WATER' | 'ELECTRIC' | 'GAS'): Promise<{
    "areaName": string;
    "deviceTotal": number;
  }[]> {
    return this.get(`/api/pengzhou/consumption/device/areaAnalysis/${type}`)
  }

  /**
   * @description 设备故障统计
   */
  public async getDeviceFaultStatistics (type: 'WATER' | 'ELECTRIC' | 'GAS'): Promise<{
    "faultRate": number;
  }> {
    return this.get(`/api/pengzhou/consumption/device/faultAnalysis/${type}`)
  }

  /**
   * @description 报警总览
   */
  public async getAlarmOverview (): Promise<{
    "totalCount": number;
  }> {
    return this.get('/api/pengzhou/consumption/alarm/overview')
  }
  /**
   * @description 报警事件分析
   */
  public async getAlarmEventAnalysis (status: number): Promise<{
    "type": string;
    "typeDesc": string;
    "count": number;
  }[]> {
    return this.get(`/api/pengzhou/consumption/alarm/event/analysis/${status}`)
  }
  /**
   * @description 报警级别统计
   */
  public async getAlarmLevelStatistics (type: string): Promise<{
    "level": number;
    "levelDesc": string;
    "count": number;
  }[]> {
    return this.get(`/api/pengzhou/consumption/alarm/level/stat/${type}`)
  }
  /**
   * @description 报警类型分析
   */
  public async getAlarmTypeAnalysis (type: string): Promise<{
    "typeName": string;
    "count": number;
  }[]> {
    return this.get(`/api/pengzhou/consumption/alarm/type/analysis/${type}`)
  }
  /**
   * @description 报警时间分析
   */
  public async getAlarmTimeAnalysis (): Promise<{
    "desc": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/consumption/alarm/time/period/stat')
  }
  /**
   * @description 能耗指标总览
   */
  public async getEnergyIndexOverview (areaId?: string): Promise<{
    "type": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/index-consumption/overview', { areaId })
  }
  /**
   * @description 能耗占比分析
   */
  public async getEnergyRatioAnalysis (type: 'WATER' | 'ELECTRIC' | 'GAS'): Promise<{
    "type": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/index-consumption/ratio-analysis', { type })
  }
  /**
   * @description 单位面积能耗占比分析
   */
  public async getEnergyPerUnitAreaRatioAnalysis (): Promise<Record<string, {
    "type": string;
    "count": number;
  }[]>> {
    return this.get('/api/pengzhou/index-consumption/area-ratio-analysis')
  }
  /**
   * @description 同类建筑能耗对比
   */
  public async getSimilarBuildingEnergyComparison (type: 'WATER' | 'ELECTRIC' | 'GAS'): Promise<{
    "value": number;
    "sameTypeValue": number;
    "time": string;
  }> {
    return this.get('/api/pengzhou/contrast-consumption/same-type-building', { type })
  }
  /**
   * @description 同类建筑能耗趋势对比
   */
  public async getSimilarBuildingEnergyTrendComparison (type: 'WATER' | 'ELECTRIC' | 'GAS'): Promise<{
    "value": number;
    "sameTypeValue": number;
    "time": string;
  }[]> {
    return this.get('/api/pengzhou/contrast-consumption/same-type-building/trend', { type })
  }
  /**
   * @description 同类建筑高峰对比
   */
  public async getSimilarBuildingPeakComparison (type: 'WATER' | 'ELECTRIC' | 'GAS'): Promise<{
    "value": number;
    "sameTypeValue": number;
    "time": number;
  }> {
    return this.get('/api/pengzhou/contrast-consumption/same-type-building/peak', { type })
  }
  /**
   * @description 同类建筑能耗时间趋势对比
   */
  public async getSimilarBuildingEnergyTimeTrendComparison (type: 'WATER' | 'ELECTRIC' | 'GAS'): Promise<{
    "value": number;
    "sameTypeValue": number;
    "time": string;
  }[]> {
    return this.get('/api/pengzhou/contrast-consumption/same-type-building/trend/peak', { type })
  }
}