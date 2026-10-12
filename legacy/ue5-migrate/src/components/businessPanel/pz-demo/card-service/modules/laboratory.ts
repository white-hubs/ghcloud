import { PZBaseCardService } from '../base-card-service'

/**
 * @description 彭州实验室卡片服务
 */
export class PZLaboratoryService extends PZBaseCardService {
  /**
   * @description 获取总体利用率
   * @param period 时间范围
   */
  public async getOverallUtilization (period: string): Promise<{
    totalTime: number;
    totalUseTime: number;
  }> {
    return this.get('/api/pengzhou/laboratory/device/analyse/overall_utilization', { period })
  }


  /**
   * @description 各空间设备利用率
   * @param period 时间范围
   */
  public async getSpaceUtilization (period: string): Promise<{
    "spaceName": string;
    "list": [
      {
        "deviceUtilization": number;
        "date": string;
      }
    ];
  }[]> {
    return this.get('/api/pengzhou/laboratory/device/analyse/space_utilization', { period })
  }

  /**
   * @description 设备空闲统计
   * @param period 时间范围
   */
  public async getDeviceIdleStatistics (period: string): Promise<{
    "deviceName": string;
    "useTime": number;
    "unUsedTime": number;
  }[]> {
    return this.get('/api/pengzhou/laboratory/device/analyse/idle_statistics', { period })
  }

  /**
   * @description 空闲排行榜Top5
   */
  public async getTop5IdleRanking (): Promise<{
    "deviceName": string;
    "idleTime": number;
    "ranking": number;
  }[]> {
    return this.get('/api/pengzhou/laboratory/device/analyse/idle_ranking_top5')
  }

  /**
   * @description 设备数量统计
   * @param type 空间 或 分类
   */
  public async getDeviceCountStatistics (queryType: 1 | 2): Promise<{
    deviceName: string; count: number;
  }[]> {
    return this.get('/api/pengzhou/laboratory/device/analyse/device_count_statistics', { queryType })
  }

  /**
   * @description 状态分析 环状图统计当前在线离线设备比率
   */
  public async getStatusAnalysis (): Promise<{
    "onlineCount": number;
    "offlineCount": number;
  }> {
    return this.get('/api/pengzhou/laboratory/device/analyse/status_analysis')
  }

  /**
   * @description 设备异常统计
   */
  public async getDeviceAbnormalStatistics (): Promise<{
    "deviceName": string;
    "eventDate": number;
  }[]> {
    return this.get('/api/pengzhou/laboratory/device/analyse/exception_statistics')
  }

  /**
   * @description 设备故障统计
   */
  public async getDeviceFaultStatistics (): Promise<{
    "faultRate": number;
    "faultDate": number;
  }[]> {
    return this.get('/api/pengzhou/laboratory/device/analyse/fault_statistics')
  }

  /**
   * @description 温度趋势统计
   */
  public async getTemperatureTrendStatistics (): Promise<{
    "recordTime": number;
    "temperature": number;
    "isMax": boolean;
    "isMin": boolean;
  }[]> {
    return this.get('/api/pengzhou/laboratory/env/trend/temperatureTrend')
  }

  /**
   * @description 湿度趋势统计
   */
  public async getHumidityTrendStatistics (): Promise<{
    "humidity": number;
    "recordTime": number;
    "isMax": boolean;
    "isMin": boolean;
  }[]> {
    return this.get('/api/pengzhou/laboratory/env/trend/humidityTrend')
  }

  /**
   * @description 气压趋势统计
   */
  public async getPressureTrendStatistics (): Promise<{
    "pressure": number;
    "recordTime": number;
    "isMax": boolean;
    "isMin": boolean;
  }[]> {
    return this.get('/api/pengzhou/laboratory/env/trend/pressureTrend')
  }
  /**
   * @description 风速趋势统计
   */
  public async getWindSpeedTrendStatistics (): Promise<{
    "windSpeed": number;
    "recordTime": number;
    "isMax": boolean;
    "isMin": boolean;
  }[]> {
    return this.get('/api/pengzhou/laboratory/env/trend/windSpeedTrend')
  }
  /**
   * @description 降水趋势统计
   */
  public async getPrecipitationTrendStatistics (): Promise<{
    "precipitation": number;
    "recordTime": number;
    "isMax": boolean;
    "isMin": boolean;
  }[]> {
    return this.get('/api/pengzhou/laboratory/env/trend/precipitationTrend')
  }
  /**
   * @description 一氧化碳趋势统计
   */
  public async getCarbonMonoxideTrendStatistics (): Promise<{
    "carbonMonoxide": number;
    "recordTime": number;
    "isMax": boolean;
    "isMin": boolean;
  }[]> {
    return this.get('/api/pengzhou/laboratory/env/trend/carbonMonoxideTrend')
  }

  /**
   * @description 臭氧趋势统计
   */
  public async getOzoneTrendStatistics (): Promise<{
    "ozone": number;
    "recordTime": number;
    "isMax": boolean;
    "isMin": boolean;
  }[]> {
    return this.get('/api/pengzhou/laboratory/env/trend/ozoneTrend')
  }
  /**
   * @description 二氧化硫趋势统计
   */
  public async getSulfurDioxideTrendStatistics (): Promise<{
    "sulfurDioxide": number;
    "recordTime": number;
    "isMax": boolean;
    "isMin": boolean;
  }[]> {
    return this.get('/api/pengzhou/laboratory/env/trend/sulfurDioxideTrend')
  }

  /**
   * @description 氮氧化物趋势统计
   */
  public async getNitrogenOxidesTrendStatistics (): Promise<{
    "nitrogenOxides": number;
    "recordTime": number;
    "isMax": boolean;
    "isMin": boolean;
  }[]> {
    return this.get('/api/pengzhou/laboratory/env/trend/nitrogenOxidesTrend')
  }

  /**
   * @description 预定统计
   */
  public async getBookingStatistics (): Promise<{
    "reservationCount": number;
  }> {
    return this.get('/api/pengzhou/laboratory/use/analyse/reservationStats')
  }

  /**
   * @description 空闲统计
   */
  public async getIdleStatistics (): Promise<{
    "idleCount": number;
    "occupiedCount": number;
  }> {
    return this.get('/api/pengzhou/laboratory/use/analyse/idleStats')
  }
  /**
   * @description 利用率统计
   * @param period 时间范围
   */
  public async getUtilizationStatistics (period: string): Promise<{
    "recordDate": string;
    "utilizationRate": number;
  }[]> {
    return this.get('/api/pengzhou/laboratory/use/analyse/utilizationStats', { period })
  }
  /**
   * @description 不同区域利用率
   */
  public async getAreaUtilizationStatistics (): Promise<{
    "recordDate": string;
    "utilizationRate": number;
  }[]> {
    return this.get('/api/pengzhou/laboratory/use/analyse/areaUtilizationStats')
  }
  /**
   * @description 不同区域使用率
   */
  public async getAreaUsageStatistics (): Promise<{
    "recordDate": string;
    "usageRate": number;
  }[]> {
    return this.get('/api/pengzhou/laboratory/use/analyse/areaUsageStats')
  }
  /**
   * @description 预定趋势
   */
  public async getBookingTrendStatistics (): Promise<{
    "recordDate": number;
    "dayOfWeek": string;
    "reservationCount": number;
  }[]> {
    return this.get('/api/pengzhou/laboratory/use/analyse/reservationTrend')
  }

  /**
   * @description 使用率分析
   */
  public async getUsageAnalysis (): Promise<{
    "weekOfMonth": number;
    "usageRate": number;
  }[]> {
    return this.get('/api/pengzhou/laboratory/op/analyse/weeklyUsage')
  }


  /**
   * @description 设备利用率分析
   */
  public async getDeviceUtilizationAnalysis (): Promise<{
    "deviceCount": number;
    "usageRate": number;
    "increaseRate": number;
  }> {
    return this.get('/api/pengzhou/laboratory/op/analyse/deviceStats')
  }

  /**
   * @description 设备状态分布
   */
  public async getDeviceStatusDistribution (): Promise<{
    "deviceCount": number;
    "normalCount": number;
    "faultCount": number;
    "offlineCount": number;
    "alarmCount": number;
  }> {
    return this.get('/api/pengzhou/laboratory/op/analyse/deviceStatus')
  }

  /**
   * @description 不同区域使用率
   */
  public async getAreaUsageAnalysis (): Promise<{
    "areaName": string;
    "usageRate": number;
  }[]> {
    return this.get('/api/pengzhou/laboratory/op/analyse/areaUsage')
  }
}
