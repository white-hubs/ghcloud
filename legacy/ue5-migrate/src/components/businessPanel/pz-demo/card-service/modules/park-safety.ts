import { PZBaseCardService } from '../base-card-service'
/**
 * @description 彭州园区安全卡片服务
 */
export class PZParkSafetyCardService extends PZBaseCardService {
  /**
   * @description 访客通行-访客信息录入及年龄统计
   */
  public async getVisitorInfoEntryAndAgeStat (): Promise<{
    id: string;
    visitorName: string;
    admissionTime: string;
    departureTime: string;
    purpose: string;
    age: number;
    authStatus: number;
  }[]> {
    return this.get('/api/pengzhou/visitor/list')
  }
  /**
   * @description 访客通行-身份信息验证
   */
  public async getVisitorIdentityVerification (): Promise<{
    authStatus: number;
    authStatusCount: number;
  }[]> {
    return this.get('/api/pengzhou/visitor/auth')
  }
  /**
   * @description 访客通行-访客年龄分布
   */
  public async getVisitorAgeDistribution (): Promise<Record<string, unknown>> {
    return this.get('/api/park-safety/visitor-age-distribution')
  }
  /**
   * @description 访客通行-访客趋势统计
   */
  public async getVisitorTrendStatistics (params: {
    type: string;
    period: string;
  }): Promise<{
      time: string;
      count: number;
    }[]> {
    return this.get('/api/pengzhou/visitor/trend', params)
  }

  /**
   * @description 报警信息-报警等级分类
   */
  public async getAlarmLevelClassification (params: {
    type: string;
    period: string;
  }): Promise<{
      alarmLevel: number;
      levelCount: number;
    }[]> {
    return this.get('/api/pengzhou/alarm/level', params)
  }
  /**
   * @description 报警信息-报警处理时长统计
   */
  public async getAlarmProcessingDurationStatistics (): Promise<{
    maxDuration: number;
    avgDuration: number;
  }> {
    return this.get('/api/pengzhou/alarm/processing/duration')
  }
  /**
   * @description 报警信息-报警消息通知
   */
  public async getAlarmMessageNotification (params: {
    type: string;
    period: string;
  }): Promise<{
      noticeType: number;
      noticeCount: number;
    }[]> {
    return this.get('/api/pengzhou/alarm/notice', params)
  }
  /**
   * @description 报警信息-报警事件分析
   */
  public async getAlarmEventAnalysis (params?: {
    processingStatus: number;
  }): Promise<{
      alarmType: number;
      alarmTypeCount: number;
    }[]> {
    return this.get('/api/pengzhou/alarm/analysis', params)
  }

  /**
   * @description 安全事件分析-总览
   */
  public async getSecurityEventOverview (): Promise<{
    count: number;
    processingCount: number;
  }> {
    return this.get('/api/pengzhou/event/overview')
  }
  /**
   * @description 安全事件分析-安全事件分析
   */
  public async getSecurityEventAnalysis (): Promise<{
    processingStatus: number;
    processingStatusCount: number;
  }[]> {
    return this.get('/api/pengzhou/event/analysis')
  }
  /**
   * @description 安全事件分析-报警级别统计
   */
  public async getSecurityEventAlarmLevelStatistics (params: {
    type: string;
    period: string;
  }): Promise<{
      alarmLevel: number;
      levelCount: number;
    }[]> {
    return this.get('/api/pengzhou/event/level', params)
  }
  /**
   * @description 安全事件分析-处理人统计
   */
  public async getSecurityEventHandlerStatistics (): Promise<{
    personnelLevel: number;
    personnelLevelCount: number;
  }[]> {
    return this.get('/api/pengzhou/event/process/personnel')
  }
  /**
   * @description 安全事件分析-处理反馈统计
   */
  public async getSecurityEventProcessingFeedbackStatistics (): Promise<{
    allCount: number;
    notFeedbackCount: number;
    feedbackCount: number;
  }> {
    return this.get('/api/pengzhou/event/process/feedback')
  }
  /**
   * @description 安全事件分析-区域安全事件分析
   */
  public async getSecurityEventAreaAnalysis (): Promise<{
    regionType: number;
    regionTypeCount: number;
  }[]> {
    return this.get('/api/pengzhou/event/region')
  }
  /**
   * @description 安全事件分析-安全事件趋势分析
   */
  public async getSecurityEventTrendAnalysis (params: {
    type: string;
    period: string;
  }): Promise<{
      time: string;
      count: number;
    }[]> {
    return this.get('/api/pengzhou/event/trend', params)
  }
}