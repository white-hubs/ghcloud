import { PZBaseCardService } from '../base-card-service'

/**
 * @description 彭州空间管理卡片服务
 */
export class PZSpaceCardService extends PZBaseCardService {
  /**
   * @description 利用率分析-区域利用率
   */
  public async getSpaceUtilizationAnalysisAreaUtilization (): Promise<Record<string, unknown>> {
    return this.get('/api/space/utilizationAnalysis/areaUtilization')
  }
  /**
   * @description 利用率分析-类别利用率
   */
  public async getSpaceUtilizationAnalysisCategoryUtilization (): Promise<Record<string, unknown>> {
    return this.get('/api/space/utilizationAnalysis/categoryUtilization')
  }
  /**
   * @description 租售收益分析-总览
   */
  public async getSpaceRentSaleAnalysisOverview (): Promise<Record<string, unknown>> {
    return this.get('/api/space/rentSaleAnalysis/overview')
  }
  /**
   * @description 租售收益分析-某时间内收益汇总
   */
  public async getSpaceRentSaleAnalysisIncomeSummary (): Promise<Record<string, unknown>> {
    return this.get('/api/space/rentSaleAnalysis/incomeSummary')
  }
  /**
   * @description 租售收益分析-区域收益统计
   */
  public async getSpaceRentSaleAnalysisAreaIncome (): Promise<Record<string, unknown>> {
    return this.get('/api/space/rentSaleAnalysis/areaIncome')
  }
  /**
   * @description 租售收益分析-租赁利用率
   */
  public async getSpaceRentSaleAnalysisRentalUtilization (): Promise<Record<string, unknown>> {
    return this.get('/api/space/rentSaleAnalysis/rentalUtilization')
  }
  /**
   * @description 租售收益分析-销售利用率
   */
  public async getSpaceRentSaleAnalysisSalesUtilization (): Promise<Record<string, unknown>> {
    return this.get('/api/space/rentSaleAnalysis/salesUtilization')
  }
  /**
   * @description 租售收益分析-租售累计收益
   */
  public async getSpaceRentSaleAnalysisCumulativeIncome (): Promise<Record<string, unknown>> {
    return this.get('/api/space/rentSaleAnalysis/cumulativeIncome')
  }
  /**
   * @description 租售收益分析-某时间内销售收益
   */
  public async getSpaceRentSaleAnalysisSalesIncome (): Promise<Record<string, unknown>> {
    return this.get('/api/space/rentSaleAnalysis/salesIncome')
  }
  /**
   * @description 租售收益分析-区域销售收益分析
   */
  public async getSpaceRentSaleAnalysisAreaSalesAnalysis (): Promise<Record<string, unknown>> {
    return this.get('/api/space/rentSaleAnalysis/areaSalesAnalysis')
  }
  /**
   * @description 资产状态-设备运行状态历史
   */
  public async getSpaceAssetStatusDeviceRunningStatusHistory (): Promise<Record<string, unknown>> {
    return this.get('/api/space/assetStatus/deviceRunningStatusHistory')
  }
  /**
   * @description 资产状态-故障报警日志
   */
  public async getSpaceAssetStatusFaultAlarmLog (): Promise<Record<string, unknown>> {
    return this.get('/api/space/assetStatus/faultAlarmLog')
  }
  /**
   * @description 资产状态-预警日志
   */
  public async getSpaceAssetStatusWarningLog (): Promise<Record<string, unknown>> {
    return this.get('/api/space/assetStatus/warningLog')
  }
  /**
   * @description 租售比分析-租售比统计
   */
  public async getSpaceRentSaleRatioAnalysisRentSaleRatioStatistics (): Promise<Record<string, unknown>> {
    return this.get('/api/space/rentSaleRatioAnalysis/rentSaleRatioStatistics')
  }
  /**
   * @description 租售比分析-租售比分析
   */
  public async getSpaceRentSaleRatioAnalysisRentSaleRatioAnalysis (): Promise<Record<string, unknown>> {
    return this.get('/api/space/rentSaleRatioAnalysis/rentSaleRatioAnalysis')
  }
  /**
   * @description 租售比分析-数据收集
   */
  public async getSpaceRentSaleRatioAnalysisDataCollection (): Promise<Record<string, unknown>> {
    return this.get('/api/space/rentSaleRatioAnalysis/dataCollection')
  }
  /**
   * @description 租售比分析-租售比分类分析
   */
  public async getSpaceRentSaleRatioAnalysisRentSaleRatioClassificationAnalysis (): Promise<Record<string, unknown>> {
    return this.get('/api/space/rentSaleRatioAnalysis/rentSaleRatioClassificationAnalysis')
  }
  /**
   * @description 租售比分析-区域租售比
   */
  public async getSpaceRentSaleRatioAnalysisAreaRentSaleRatio (): Promise<Record<string, unknown>> {
    return this.get('/api/space/rentSaleRatioAnalysis/areaRentSaleRatio')
  }
}