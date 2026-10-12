import { PZBaseCardService } from '../base-card-service'

/**
 * @description 彭州公共服务卡片服务
 */
export class PZPublicCardService extends PZBaseCardService {
  /**
   * @description 共享空间-预定年龄分布
   */
  public async getPublicSharedSpaceAgeDistribution (): Promise<{
    "ageGroup": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/pre-age-distributions/statistics/age-group')
  }
  /**
   * @description 共享空间-预定男女占比
   */
  public async getPublicSharedSpaceGenderRatio (): Promise<{
    "id": string;
    "gender": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/pre-gender-distributions/all')
  }
  /**
   * @description 共享空间-预定人职业
   */
  public async getPublicSharedSpaceOccupation (): Promise<{
    "deleted": boolean;
    "createBy": string;
    "createTime": string;
    "updateBy": string;
    "updateTime": string;
    "tenant": number;
    "id": number;
    "career": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/pre-career-distributions/all')
  }
  /**
   * @description 共享空间-预定时间趋势
   */
  public async getPublicSharedSpaceBookingTimeTrend (period: string, type: string): Promise<{
    "time": string;
    "count": number;
    "isPeak": boolean;
    "isLow": boolean;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/pre-reservation-trends/statistics', { period, type })
  }
  /**
   * @description 共享空间-预定区域分析
   */
  public async getPublicSharedSpaceBookingAreaAnalysis (): Promise<{
    "deleted": boolean;
    "createBy": string;
    "createTime": string;
    "updateBy": string;
    "updateTime": string;
    "tenant": number;
    "id": number;
    "area": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/pre-area-distributions/all')
  }
  /**
   * @description 共享空间-空间预定趋势
   */
  public async getPublicSharedSpaceSpaceBookingTrend (period: string): Promise<{
    "time": string;
    "areas": [
      {
        "time": number;
        "area": string;
        "count": number;
      }
    ];
  }[]> {
    return this.get('/api/pengzhou/pre-area-reservation-trends/statistics', { period })
  }

  /**
   * @description  消费分析-总收入趋势
   */
  public async getPublicConsumptionAnalysisIncome (period: string): Promise<{
    "time": string;
    "count": number;
    "isPeak": boolean;
  }[]> {
    return this.get('/api/pengzhou/consumption-amount-trends/statistics', { period })
  }
  /**
   * @description 消费分析-消费方式占比
   */
  public async getPublicConsumptionAnalysisConsumptionMethodRatio (): Promise<{
    "id": string;
    "consumptionType": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/consumption-type-distributions/all')
  }
  /**
   * @description 消费分析-消费人数
   */
  public async getPublicConsumptionAnalysisConsumptionCount (period: string, type: string): Promise<{
    "time": string;
    "count": number;
    "isPeak": boolean;
    "isLow": boolean;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/consumption-person-trends/statistics', { period, type })
  }
  /**
   * @description 消费分析-性别占比
   */
  public async getPublicConsumptionAnalysisGenderRatio (): Promise<{
    "id": string;
    "gender": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/consumption-gender-distributions/all')
  }
  /**
   * @description 消费分析-消费趋势分析
   */
  public async getPublicConsumptionAnalysisConsumptionTrendAnalysis (period: string, type: string): Promise<{
    "time": string;
    "count": number;
    "isPeak": boolean;
    "isLow": boolean;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/consumption-num-trends/statistics', { period, type })
  }
  /**
   * @description 消费分析-收费总览
   */
  public async getPublicConsumptionAnalysisChargeOverview (): Promise<{
    "payments": number;
    "count": number;
  }> {
    return this.get('/api/pengzhou/consumption-overview')
  }
  /**
   * @description 消费分析-收费趋势统计
   */
  public async getPublicConsumptionAnalysisChargeTrendStatistics (period: string, type: string): Promise<{
    "time": string;
    "count": number;
    "isPeak": boolean;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/consumption-free-trends/statistics', { period, type })
  }
  /**
   * @description 专家咨询-技术咨询占比
   */
  public async getPublicExpertConsultationTechnicalConsultationRatio (): Promise<{
    "id": string;
    "type": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/consult-technology-distribution/all')
  }
  /**
   * @description 专家咨询-技术咨询趋势
   */
  public async getPublicExpertConsultationTechnicalConsultationTrend (period: string, type: string): Promise<{
    "time": string;
    "count": number;
    "isPeak": boolean;
    "isLow": boolean;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/consult-technology-trends/statistics', { period, type })
  }
  /**
   * @description 专家咨询-法律咨询占比
   */
  public async getPublicExpertConsultationLegalAdviceRatio (): Promise<{
    "id": string;
    "type": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/consult-law-distribution/all')
  }
  /**
   * @description 专家咨询-法律咨询趋势
   */
  public async getPublicExpertConsultationLegalAdviceTrend (period: string, type: string): Promise<{
    "time": string;
    "count": number;
    "isPeak": boolean;
    "isLow": boolean;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/consult-law-trends/statistics', { period, type })
  }
  /**
   * @description 专家咨询-市场营销咨询占比
   */
  public async getPublicExpertConsultationMarketingConsultationRatio (): Promise<{
    "id": string;
    "type": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/consult-market-distribution/all')
  }
  /**
   * @description 专家咨询-市场营销咨询趋势
   */
  public async getPublicExpertConsultationMarketingConsultationTrend (period: string, type: string): Promise<{
    "time": string;
    "count": number;
    "isPeak": boolean;
    "isLow": boolean;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/consult-market-trends/statistics', { period, type })
  }
  /**
   * @description 项目孵化-项目申报占比
   */
  public async getPublicProjectIncubationProjectDeclarationRatio (): Promise<{
    "id": string;
    "type": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/project-declare-distribution/all')
  }
  /**
   * @description 项目孵化-申报趋势分析
   */
  public async getPublicProjectIncubationProjectDeclarationTrendAnalysis (period: string, type: string): Promise<{
    "time": string;
    "count": number;
    "isPeak": boolean;
    "isLow": boolean;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/project-declare-trends/statistics', { period, type })
  }
  /**
   * @description 项目孵化-项目评审占比
   */
  public async getPublicProjectIncubationProjectReviewRatio (): Promise<{
    "id": string;
    "type": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/project-review-distribution/all')
  }
  /**
   * @description 项目孵化-评审趋势分析
   */
  public async getPublicProjectIncubationProjectReviewTrendAnalysis (period: string, type: string): Promise<{
    "time": string;
    "count": number;
    "isPeak": boolean;
    "isLow": boolean;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/project-review-trends/statistics', { period, type })
  }
  /**
   * @description 项目孵化-资金支持占比
   */
  public async getPublicProjectIncubationFundSupportRatio (): Promise<{
    "id": string;
    "type": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/project-amount-distribution/all')
  }
  /**
   * @description 项目孵化-咨询支持趋势分析
   */
  public async getPublicProjectIncubationConsultationSupportTrendAnalysis (period: string, type: string): Promise<{
    "time": string;
    "count": number;
    "isPeak": boolean;
    "isLow": boolean;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/project-amount-trends/statistics', { period, type })
  }
  /**
   * @description 投诉建议-年龄分布
   */
  public async getPublicComplaintSuggestionAgeDistribution (): Promise<{
    "ageGroup": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/complaint-age-distributions/statistics/age-group')
  }
  /**
   * @description 投诉建议-性别占比分析
   */
  public async getPublicComplaintSuggestionGenderRatioAnalysis (): Promise<{
    "id": string;
    "gender": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/complaint-gender-distributions/all')
  }
  /**
   * @description 投诉建议-职业分析
   */
  public async getPublicComplaintSuggestionOccupationAnalysis (): Promise<{
    "id": string;
    "career": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/complaint-career-distributions/all')
  }
  /**
   * @description 投诉建议-投诉时间趋势
   */
  public async getPublicComplaintSuggestionComplaintTimeTrend (period: string, type: string): Promise<{
    "time": string;
    "count": number;
    "isPeak": boolean;
    "isLow": boolean;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/complaint-reservation-trends/statistics', { period, type })
  }
  /**
   * @description 投诉建议-投诉区域分析
   */
  public async getPublicComplaintSuggestionComplaintAreaAnalysis (): Promise<{
    "id": string;
    "area": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/complaint-area-distributions/all')
  }
  /**
   * @description 投诉建议-投诉时间占比
   */
  public async getPublicComplaintSuggestionComplaintTimeRatio (): Promise<{
    "time": string;
    "count": number;
    "isPeak": boolean;
    "isLow": boolean;
  }[]> {
    return this.get('/api/pengzhou/complaint-reservation-trends/statistics/time-distribution')
  }
  /**
   * @description 投诉建议-投诉人群占比
   */
  public async getPublicComplaintSuggestionComplaintCrowdRatio (): Promise<{
    "id": string;
    "crowd": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/complaint-crowd-distributions/all')
  }
  /**
   * @description 投诉建议-满意度分析
   */
  public async getPublicComplaintSuggestionSatisfactionAnalysis (): Promise<{
    "id": string;
    "satisfied": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/complaint-satisfied-distributions/all')
  }
}