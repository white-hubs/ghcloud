import { PZBaseCardService } from '../base-card-service'
/**
 * @description 彭州态势感知卡片服务
 */
export class PZSituationalCardService extends PZBaseCardService {
  /**
   * @description 总览-实验室运行趋势
   */
  public async getSituationalOverviewLaboratoryRunningTrend (): Promise<Record<string, unknown>> {
    return this.get('/api/situational/overview/laboratoryRunningTrend')
  }
  /**
   * @description 总览-停车场运行趋势
   */
  public async getSituationalOverviewParkingRunningTrend (): Promise<Record<string, unknown>> {
    return this.get('/api/situational/overview/parkingRunningTrend')
  }
  /**
   * @description 总览-资产运营
   */
  public async getSituationalOverviewAssetOperation (): Promise<Record<string, unknown>> {
    return this.get('/api/situational/overview/assetOperation')
  }
  /**
   * @description 总览-设备设施
   */
  public async getSituationalOverviewDeviceFacilities (): Promise<Record<string, unknown>> {
    return this.get('/api/situational/overview/deviceFacilities')
  }
  /**
   * @description 异常监测-预警信息汇聚
   */
  public async getSituationalExceptionMonitoringWarningInformationConvergence (): Promise<Record<string, unknown>> {
    return this.get('/api/situational/exceptionMonitoring/warningInformationConvergence')
  }
  /**
   * @description 异常监测-预警信息展示
   */
  public async getSituationalExceptionMonitoringWarningInformationDisplay (): Promise<Record<string, unknown>> {
    return this.get('/api/situational/exceptionMonitoring/warningInformationDisplay')
  }
  /**
   * @description 异常监测-预警阈值
   */
  public async getSituationalExceptionMonitoringWarningThreshold (): Promise<Record<string, unknown>> {
    return this.get('/api/situational/exceptionMonitoring/warningThreshold')
  }
}