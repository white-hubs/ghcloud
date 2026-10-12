import { PZBaseCardService } from '../base-card-service'

/**
 * @description 彭州停车卡片服务
 */
export class PZParingService extends PZBaseCardService{
  /**
   * @description 运行监控-停车率统计
   */
  public async getParkingRateStatistics (): Promise<ParkingRateStatistics> {
    return this.get('/api/pengzhou/ioc/area-park-record/park-ratio')
  }
  /**
   * @description 运行监控-停车趋势分析
   */
  public async getParkingTrendAnalysis (params: {
    period?: string;
    type?: string;
  }): Promise<ParkingTrendAnalysis[]> {
    return this.get('/api/pengzhou/ioc/area-park-record/park-trend', params)
  }
  /**
   * @description 运行监控-区域停车量分析
   */
  public async getParkingAreaAnalysis (): Promise<ParkingAreaAnalysis[]> {
    return this.get('/api/pengzhou/ioc/area-park-record/area-park-count')
  }
  /**
   * @description 运行监控-空闲车位统计
   */
  public async getFreeParkingStatistics (): Promise<FreeParkingStatistics[]> {
    return this.get('/api/pengzhou/ioc/area-park-record/free-park-count')
  }
  /**
   * @description 运行监控-停车类型统计
   */
  public async getParkingTypeStatistics (): Promise<ParkingAreaAnalysis[]> {
    return this.get('/api/pengzhou/ioc/area-park-record/park-type-count')
  }
  /**
   * @description 运行监控-平均停车时长统计
   */
  public async getAverageParkingDurationStatistics (params: {
    period?: string;
    type?: string;
  }): Promise<AverageParkingDurationStatistics[]> {
    return this.get('/api/pengzhou/ioc/area-park-record/park-duration-count', params)
  }
  /**
   * @description 运行监控-滞留车位分析
   */
  public async getStayedParkingAnalysis (): Promise<StayedParkingAnalysis[]> {
    return this.get('/api/pengzhou/ioc/area-park-record/park-remain-count')
  }
  /**
   * @description 预约分析-预约总览
   */
  public async getBookingOverview (): Promise<BaseTypeStatisticsVO[]> {
    return this.get('/api/pengzhou/ioc/area-park-reservation/overview')
  }
  /**
   * @description 预约分析-支付方式分析
   */
  public async getPaymentMethodAnalysis (): Promise<BaseTypeStatisticsVO[]> {
    return this.get('/api/pengzhou/ioc/area-park-reservation/pay-type-analysis')
  }
  /**
   * @description 预约分析-车位占用时间分析
   */
  public async getParkingOccupancyTimeAnalysis (params: {
    period?: string;
    type?: string;
  }): Promise<AreaParkRecordVO3[]> {
    return this.get('/api/pengzhou/ioc/area-park-reservation/parking-time-analysis', params)
  }
  /**
   * @description 预约分析-提前预约时间趋势分析
   */
  public async getEarlyBookingTimeTrendAnalysis (params: {
    period?: string;
    type?: string;
  }): Promise<AreaParkReservationVO[]> {
    return this.get('/api/pengzhou/ioc/area-park-reservation/advance-reservation-trend-analysis', params)
  }

  /**
   * @description 费用分析-停车时间分析
   */
  public async getParkingTimeAnalysis (): Promise<AreaParkTimeAnalysisPO[]> {
    return this.get('/api/pengzhou/ioc/area-park-income/parking-time-analysis')
  }
  /**
   * @description 费用分析-停车费用总览
   */
  public async getParkingFeeOverview (): Promise<number> {
    return this.get('/api/pengzhou/ioc/area-park-income/today-income')
  }
  /**
   * @description 费用分析-包月服务占比
   */
  public async getMonthlyServiceProportionAnalysis (): Promise<Record<string, unknown>> {
    return this.get('/api/pengzhou/monthlyServiceProportionAnalysis')
  }
  /**
   * @description 费用分析-停车费用分析
   */
  public async getParkingFeeAnalysis (params: {
    period?: string;
    type?: string;
    areaId?: string;
  }): Promise<TrendDecimalStatisticsVO[]> {
    return this.get('/api/pengzhou/ioc/area-park-income/parking-fee-analysis', params)
  }
  /**
   * @description 费用分析-优惠金额占比
   */
  public async getDiscountAmountProportionAnalysis (params: {
    period?: string;
    type?: string;
  }): Promise<AreaParkIncomeVO> {
    return this.get('/api/pengzhou/ioc/area-park-income/discount-amount-ratio', params)
  }

  /**
   * @description 充电桩分析-概览
   */
  public async getChargingStationOverview (): Promise<BookingOverview> {
    return this.get('/api/pengzhou/ioc/area-park-charge/overview')
  }
  /**
   * @description 充电桩分析-区域分布分析
   */
  public async getChargingStationAreaDistributionAnalysis (): Promise<AreaStatsVO[]> {
    return this.get('/api/pengzhou/ioc/area-park-charge/area-distribution-analysis')
  }
  /**
   * @description 充电桩分析-使用趋势分析
   */
  public async getChargingStationUsageTrendAnalysis (params: {
    period?: string;
    type?: string;
  }): Promise<TrendDecimalStatisticsVO[]> {
    return this.get('/api/pengzhou/ioc/area-park-charge/trend-analysis', params)
  }
  /**
   * @description 充电桩分析-排名统计
   */
  public async getChargingStationRankingStatistics (): Promise<AreaParkChargeVO[]> {
    return this.get('/api/pengzhou/ioc/area-park-charge/rank-statistics')
  }
}
export interface ParkingRateStatistics {
  /**
   * 已停车位数据
   */
  parkCount?: number;
  /**
   * 停车率
   */
  parkRate?: number;
  /**
   * 总停车位数据
   */
  totalParkCount?: number;
}
export interface ParkingTrendAnalysis {
  /**
   * 数量
   */
  count?: number;
  /**
   * 是否为最高峰
   */
  isPeak?: boolean;
  /**
   * 时间点
   */
  time?: string;
}
export interface ParkingAreaAnalysis {
  /**
   * 区域
   */
  area?: string;
  /**
   * 数量
   */
  count?: number;
}
export interface FreeParkingStatistics {
  /**
   * 区域名称
   */
  areaName?: string;
  /**
   * 空闲车位数据
   */
  freeParkCount?: number;
  /**
   * 滞留车位
   */
  remainingParkCount?: number;
  /**
   * 总停车位数据
   */
  totalParkCount?: number;
}
export interface AverageParkingDurationStatistics {
  /**
   * 数量
   */
  count?: number;
  /**
   * 是否为最高峰
   */
  isPeak?: boolean;
  /**
   * 时间点
   */
  time?: string;
}
export interface StayedParkingAnalysis {
  /**
   * 区域名称
   */
  areaName?: string;
  /**
   * 空闲车位数据
   */
  freeParkCount?: number;
  /**
   * 滞留车位
   */
  remainingParkCount?: number;
  /**
   * 总停车位数据
   */
  totalParkCount?: number;
}

export interface BookingOverview {
  /**
   * 平均使用时长
   */
  avgUseTime?: number;
  /**
   * 环比
   */
  avgUseTimeChain?: number;
  /**
   * 同比
   */
  avgUseTimeOnYear?: number;
  createBy?: string;
  createTime?: string;
  deleted?: boolean;
  /**
   * 环比
   */
  faultChain?: number;
  /**
   * 故障率
   */
  faultRate?: number;
  /**
   * 同比
   */
  faultRateOnYear?: number;
  id?: number;
  tenant?: number;
  updateBy?: string;
  updateTime?: string;
  /**
   * 环比
   */
  usageChain?: number;
  /**
   * 同比
   */
  usageOnYear?: number;
  /**
   * 使用率
   */
  usageRate?: number;
}
export interface BaseTypeStatisticsVO {
  /**
   * 数量
   */
  count?: number;
  /**
   * 类型
   */
  type?: string;
}
export interface AreaParkRecordVO3 {
  /**
   * 空闲车位
   */
  freeNum?: number;
  /**
   * 占用车位
   */
  occupyNum?: number;
  /**
   * 占用率
   */
  occupyRate?: number;
  /**
   * 时间点
   */
  time?: string;
  /**
   * 总车位
   */
  totalNum?: number;
}
export interface AreaParkReservationVO {
  /**
   * 预约总数
   */
  count?: number;
  /**
   * 预约率
   */
  rate?: number;
  /**
   * 时间点
   */
  time?: string;
  /**
   * 总停车位
   */
  totalParkingSpace?: number;
}
/**
 * 停车时间分析表
 *
 */
export interface AreaParkTimeAnalysisPO {
  createBy?: string;
  createTime?: string;
  deleted?: boolean;
  id?: number;
  /**
   * 下四分位
   */
  lowerQuartile?: number;
  /**
   * 最大值
   */
  max?: number;
  /**
   * 中位数
   */
  median?: number;
  /**
   * 最小值
   */
  min?: number;
  tenant?: number;
  /**
   * 时间区间
   */
  timeRange?: string;
  updateBy?: string;
  updateTime?: string;
  /**
   * 上四分位
   */
  upperQuartile?: number;
}

export interface TrendDecimalStatisticsVO {
  /**
   * 数量
   */
  count?: number;
  /**
   * 是否为最高峰
   */
  isPeak?: boolean;
  /**
   * 时间点
   */
  time?: string;
}
export interface AreaParkIncomeVO {
  /**
   * 优惠金额
   */
  discountAmount?: number;
  /**
   * 环比
   */
  ringRatio?: number;
  /**
   * 同比
   */
  yearOnYear?: number;
}
export interface AreaStatsVO {
  /**
   * 区域名称
   */
  areaName?: string;
  /**
   * 充电桩数量
   */
  count?: number;
  /**
   * 占比(%)
   */
  ratio?: number;
}
export interface TrendDecimalStatisticsVO {
  /**
   * 数量
   */
  count?: number;
  /**
   * 是否为最高峰
   */
  isPeak?: boolean;
  /**
   * 时间点
   */
  time?: string;
}
export interface AreaParkChargeVO {
  /**
   * 归属区域
   */
  areaName?: string;
  /**
   * 充电桩名称
   */
  name?: string;
  /**
   * 使用率(%)
   */
  utilization?: number;
}
