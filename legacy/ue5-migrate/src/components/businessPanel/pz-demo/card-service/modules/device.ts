import { PZBaseCardService } from '../base-card-service'
interface StatVo {
  name: string;
  number: number;
}
/**
 * @description 设备设施卡片服务
 */
export class PZDeviceCardService extends PZBaseCardService {

  /**
   * @description 运行监控-在线统计
   */
  public async getDeviceOnlineStatistics (params: {
    areaId?: string;
    period: string;
    type: string;
  }): Promise<StatVo[]> {
    return this.get('/api/pengzhou/device/on-line', params)
  }
  /**
   * @description 运行监控-运行时间统计
   */
  public async getDeviceRunTimeStatistics (params: {
    type: string;
    period: string;
  }): Promise<{
      time: string;
      types: {
        count: number;
        time: string;
        type: string;
      }[];
    }[]> {
    return this.get('/api/pengzhou/runtime-duration/type/trends', params)
  }
  /**
   * @description 运行监控-运行功率统计
   */
  public async getDeviceRunPowerStatistics (params: {
    type: string;
    period: string;
  }): Promise<{
      time: string;
      types: {
        count: number;
        time: string;
        type: string;
      }[];
    }[]> {
    return this.get('/api/pengzhou/runtime-power', params)
  }
  /**
   * @description 运行监控-设备利用率分析
   */
  public async getDeviceUtilizationAnalysis (params: {
    type: string;
    period: string;
  }): Promise<StatVo[]> {
    return this.get('/api/pengzhou/device-utilization', params)
  }
  /**
   * @description 运行监控-设备区域分布
   */
  public async getDeviceAreaDistribution (params: {
    type: string;
    period: string;
  }): Promise<StatVo[]> {
    return this.get('/api/pengzhou/device-location-distribution', params)
  }
  /**
   * @description 运行监控-设备分类共计
   */
  public async getDeviceCategoryCount (params: {
    type: string;
    period: string;
  }): Promise<StatVo[]> {
    return this.get('/api/pengzhou/device-category-summary', params)
  }
  /**
   * @description 数据分析-数据评估
   */
  public async getDeviceDataEvaluation (params: {
    type: string;
    period: string;
  }): Promise<{
      efficiencyRate: number; // 效率
      maintenanceTime: number; // 维修时间
      failureRate: number; // 故障率
      energyConsumption: number; // 能耗
    }> {
    return this.get('/api/pengzhou/data-assessment', params)
  }
  /**
   * @description 数据分析-数据分析 在线市时长趋势
   */
  public async getDeviceDataAnalysis (params: {
    type: string;
    period: string;
  }): Promise<{
      xAxis: string[];
      runningTime: number[];
      faultFrequency: number[];
    }> {
    const runtimeDurationRes = await this.get('/api/pengzhou/runtime-duration', params) as { time: string; count: number; }[]
    const faultFrequencyRes = await this.get('/api/pengzhou/fault-frequency', params) as { time: string; count: number; }[]
    return {
      xAxis: runtimeDurationRes.map(item => item.time),
      runningTime: runtimeDurationRes.map(item => item.count),
      faultFrequency: faultFrequencyRes.map(item => item.count)
    }
  }
  /**
   * @description 数据分析-数据采集
   */
  public async getDeviceDataCollection (params: {
    type: string;
    period: string;
  }): Promise<{
      name: string;
      eventsNumber: number;
      runningTime: number;
    }[]> {
    return this.get('/api/pengzhou/data-collection', params)
  }
  /**
   * @description 数据分析-规则制定
   */
  public async getDeviceRuleSpecification (params: {
    type: string;
    period: string;
  }): Promise<{
      name: string;
      sort: number;
    }[]> {
    return this.get('/api/pengzhou/rule-setting', params)
  }
  /**
   * @description 数据分析-分析挖掘
   */
  public async getDeviceAnalysisMining (params: {
    type: string;
    period: string;
  }): Promise<{
      typeName: string;
      name: string;
      runTime: string;
      failureRate: string;
    }[]> {
    return this.get('/api/pengzhou/data-mining', params)
  }

  /**
   * @description 保险与保养-风险覆盖
   */
  public async getDeviceInsuranceRiskCoverage (params: {
    type: string;
    period: string;
  }): Promise<StatVo[]> {
    return this.get('/api/pengzhou/risk-coverage', params)
  }
  /**
   * @description 保险与保养-选择模板
   */
  public async getDeviceInsuranceTemplateSelection (params: {
    type: string;
    period: string;
  }): Promise<StatVo[]> {
    return this.get('/api/pengzhou/select-template', params)
  }
  /**
   * @description 保险与保养-保养周期
   */
  public async getDeviceMaintenanceCycle (params: {
    type: string;
    period: string;
  }): Promise<{
      type: string;
      details: {
        name: string;
        number: number;
      }[];
    }[]> {
    return this.get('/api/pengzhou/maintenance-cycle', params)
  }
  /**
   * @description 保险与保养-保险合同
   */
  public async getDeviceInsuranceContract (params: {
    type: string;
    period: string;
  }): Promise<{
      name: string;
      type: string;
      coverage: string;
      startingTime: string;
    }[]> {
    return this.get('/api/pengzhou/insurance-contract', params)
  }
  /**
   * @description 保险与保养-计划定制
   */
  public async getDeviceMaintenancePlanCustomization (params: {
    type: string;
    period: string;
  }): Promise<{
      name: string;
      sort: number;
      details: string;
    }[]> {
    return this.get('/api/pengzhou/plan-customization', params)
  }

  /**
   * @description 故障分析-数据收集
   */
  public async getDeviceFaultDataCollection (params: {
    type: string;
    period: string;
  }): Promise<{
      name: string;
      types: {
        type: string;
        number: number;
      }[];
    }[]> {
    return this.get('/api/pengzhou/fault-collection', params)
  }
  /**
   * @description 故障分析-故障分类
   */
  public async getDeviceFaultClassification (params: {
    type: string;
    period: string;
  }): Promise<StatVo[]> {
    return this.get('/api/pengzhou/fault-category', params)
  }
  /**
   * @description 故障分析-故障频率
   */
  public async getDeviceFaultFrequency (params: {
    type: string;
    period: string;
  }): Promise<{ time: string; count: number; }[]> {
    return this.get('/api/pengzhou/fault-frequency', params)
  }
  /**
   * @description 故障分析-原因分析
   */
  public async getDeviceFaultCauseAnalysis (params: {
    type: string;
    period: string;
  }): Promise<StatVo[]> {
    return this.get('/api/pengzhou/cause-analysis', params)
  }

  /**
   * @description 设备报警-运行状态
   */
  public async getDeviceAlarmRunStatus (params: {
    type: string;
    period: string;
  }): Promise<{
      name: string;
      status: {
        type: string;
        number: number;
      }[];
    }[]> {
    return this.get('/api/pengzhou/runtime-status', params)
  }
  /**
   * @description 设备报警-设备数量统计
   */
  public async getDeviceAlarmDeviceCountStatistics (params: {
    type: string;
    period: string;
  }): Promise<StatVo[]> {
    return this.get('/api/pengzhou/device-count-statistics', params)
  }
  /**
   * @description 设备报警-设备报警状态
   */
  public async getDeviceAlarmDeviceAlarmStatus (params: {
    type: string;
    period: string;
  }): Promise<StatVo[]> {
    return this.get('/api/pengzhou/device-alarm-status', params)
  }
  /**
   * @description 设备报警-报警设备类型分析
   */
  public async getDeviceAlarmAlarmDeviceTypeAnalysis (params: {
    type: string;
    period: string;
  }): Promise<{
      name: string;
      number: number;
      deviceNames: string;
    }[]> {
    return this.get('/api/pengzhou/alarm-device-type-analysis', params)
  }
  /**
   * @description 设备报警-报警设备类型统计
   */
  public async getDeviceAlarmAlarmDeviceTypeStatistics (params: {
    type: string;
    period: string;
  }): Promise<{
      deviceType: string;
      details: {
        name: string;
        number: number;
      }[];
    }[]> {
    return this.get('/api/pengzhou/alarm-device-type-statistics', params)
  }
}