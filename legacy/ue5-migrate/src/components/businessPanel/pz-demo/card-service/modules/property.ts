import type { PageResultState } from '@ghcloud/cube-protocol'
import { PZBaseCardService } from '../base-card-service'

/**
 * @description 彭州物业服务卡片服务
 */
export class PZPropertyCardService extends PZBaseCardService {
  /**
   * @description 日常服务-公告统计
   */
  public async getPropertyNoticeStatistics (): Promise<{
    "type": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/daily-notice-records/statistics/type-group')
  }
  /**
   * @description 日常服务-公告详情介绍
   */
  public async getPropertyNoticeDetail (): Promise<PageResultState<{
    "id": number;
    "title": string;
    "content": string;
    "type": string;
    "pushTime": string;
  }>> {
    return this.get('/api/pengzhou/daily-notice-records', { pageSize: 5, pageNumber: 1 })
  }
  /**
   * @description 日常服务-车辆通行统计
   */
  public async getPropertyVehiclePassageStatistics (period: string, type: string): Promise<{
    "id": string;
    "type": string;
    "count": number;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/daily-park-access-distribution/statistics/type-group', { period, type })
  }
  /**
   * @description 日常服务-车辆通行分析
   */
  public async getPropertyVehiclePassageAnalysis (period: string, type: string): Promise<{
    "time": string;
    "count": number;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/daily-park-access-trends/statistics', { period, type })
  }
  /**
   * @description 日常服务-物品放行统计
   */
  public async getPropertyItemReleaseStatistics (period: string, type: string): Promise<{
    "type": string;
    "count": number;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/daily-goods-access-distribution/statistics/type-group', { period, type })
  }
  /**
   * @description 日常服务-物品放行分析
   */
  public async getPropertyItemReleaseAnalysis (period: string, type: string): Promise<{
    "id": string;
    "time": string;
    "count": number;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/daily-goods-access-trends/statistics', { period, type })
  }
  /**
   * @description 日常服务-服务满意度 雷达图
   */
  public async getPropertyServiceSatisfactionStatistics (): Promise<{
    "id": string;
    "type": string;
    "score": number;
  }[]> {
    return this.get('/api/pengzhou/daily-satisfied-analysis/statistics')
  }
  /**
   * @description 日常服务-物业通知时间分析
   */
  public async getPropertyPropertyNotificationTimeAnalysis (period: string, type: string): Promise<{
    "time": "";
    "count": 0;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/daily-notice-records/statistics/time-distribution', { period, type })
  }

  /**
   * @description 安全巡查-安全巡查管理
   */
  public async getPropertySecurityPatrolManagement (pageSize: number, pageNumber: number): Promise<PageResultState<{
    "id": number;
    "eventType": string;
    "patrolTime": string;
    "personName": string;
    "address": string;
    "content": string;
  }>> {
    return this.get('/api/pengzhou/patrol-records', { pageSize, pageNumber })
  }
  /**
   * @description 安全巡查-安全巡查事件统计
   */
  public async getPropertySecurityPatrolEventStatistics (period?: string, type?: string): Promise<{
    "eventType": string;
    "count": number;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/patrol-records/statistics/event-type/group', { period, type })
  }
  /**
   * @description 安全巡查-安全巡查记录分析
   */
  public async getPropertySecurityPatrolRecordAnalysis (period: string, type: string): Promise<{
    "time": string;
    "count": number;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/patrol-records/statistics/trends', { period, type })
  }
  /**
   * @description 会议室-会议室可用时间
   */
  public async getPropertyMeetingRoomAvailableTime (): Promise<{
    "id": number;
    "name": string;
    "startTime": string;
    "endTime": string;
  }[]> {
    return this.get('/api/pengzhou/meeting-room-idle/statistics')
  }
  /**
   * @description 会议室-会议室剩余时间
   */
  public async getPropertyMeetingRoomRemainingTime (): Promise<{
    "id": number;
    "name": string;
    "remaining": number;
  }[]> {
    return this.get('/api/pengzhou/meeting-room-remaining/statistics')
  }
  /**
   * @description 会议室-会议室预定次数
   */
  public async getPropertyMeetingRoomBookingCount (period: string, type: string): Promise<{
    "name": string;
    "count": number;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/meeting-room-reserve/statistics', { period, type })
  }
  /**
   * @description 会议室-会议室设备状态
   */
  public async getPropertyMeetingRoomDeviceStatus (): Promise<{
    "id": number;
    "name": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/meeting-room-device-state/statistics')
  }
  /**
   * @description 会议室-会议室营收状态
   */
  public async getPropertyMeetingRoomRevenueStatus (period: string, type: string): Promise<{
    "name": string;
    "amount": number;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/meeting-room-amount/statistics', { period, type })
  }
  /**
   * @description 报事报修-今日报修人数
   */
  public async getPropertyComplaintRepairTodayRepairCount (): Promise<number> {
    return this.get('/api/pengzhou/repair-records/statistics/today/person/count')
  }
  /**
   * @description 报事报修-接收人处理率
   */
  public async getPropertyComplaintRepairReceiverProcessingRate (): Promise<{
    "name": string;
    "count": number;
    "handlerCount": number;
    "handlerRatio": number;
  }[]> {
    return this.get('/api/pengzhou/repair-records/statistics/person/handler-ratio')
  }
  /**
   * @description 报事报修-重要事件统计
   */
  public async getPropertyComplaintRepairImportantEventStatistics (period: string, type: string): Promise<{
    "name": string;
    "count": number;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/repair-records/statistics/level/count', { period, type })
  }
  /**
   * @description 报事报修-事件分类统计
   */
  public async getPropertyComplaintRepairEventCategoryStatistics (period: string, type: string): Promise<{
    "name": string;
    "count": number;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/repair-records/statistics/type/count', { period, type })
  }
  /**
   * @description 报事报修-处置情况统计
   */
  public async getPropertyComplaintRepairDisposalCaseStatistics (period: string, type: string): Promise<{
    "name": string;
    "count": number;
    "handlerCount": number;
    "handlerRatio": number;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/repair-records/statistics/type/handler-ratio', { period, type })
  }
  /**
   * @description 报事报修-工单排行
   */
  public async getPropertyComplaintRepairWorkOrderRank (pageSize: number, pageNumber: number): Promise<PageResultState<{
    "name": string;
    "count": number;
  }>> {
    return this.get('/api/pengzhou/repair-records/statistics/person/count/top', { pageSize, pageNumber })
  }
  /**
   * @description 报事报修-工单处理进度
   */
  public async getPropertyComplaintRepairWorkOrderProcessingProgress (pageSize: number, pageNumber: number): Promise<PageResultState<{
    "id": number;
    "type": string;
    "level": string;
    "area": string;
    "recordTime": string;
    "repairUserName": string;
    "acceptUserName": string;
    "status": string;
    "handlerTime": string;
    "name": string;
  }>> {
    return this.get('/api/pengzhou/repair-records', { pageSize, pageNumber })
  }
  /**
   * @description 报事报修-时间趋势
   */
  public async getPropertyComplaintRepairTimeTrend (period: string, type: string): Promise<{
    "time": string;
    "count": number;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/repair-record/statistics/trend', { period, type })
  }
  /**
   * @description 报事报修-区域分布
   */
  public async getPropertyComplaintRepairAreaDistribution (period: string, type: string): Promise<{
    "name": string;
    "count": number;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/repair-record/statistics/area/count', { period, type })
  }
  /**
   * @description 缴费分析-金额总览
   */
  public async getPropertyPaymentAnalysisAmountOverview (): Promise<{
    "id": number;
    "area": string;
    "amount": number;
    "arrearsAmount": number;
  }[]> {
    return this.get('/api/pengzhou/rs-payments/statistics/area')
  }
  /**
   * @description 缴费分析-缴费分类分析
   */
  public async getPropertyPaymentAnalysisPaymentCategoryAnalysis (): Promise<{
    "id": number;
    "type": string;
    "amount": number;
  }[]> {
    return this.get('/api/pengzhou/rs-payments/statistics/expense-type')
  }
  /**
   * @description 缴费分析-待缴费分析
   */
  public async getPropertyPaymentAnalysisPendingPaymentAnalysis (): Promise<{
    "id": number;
    "type": string;
    "amount": number;
  }[]> {
    return this.get('/api/pengzhou/rs-payments/statistics/pending-expense-type')
  }
  /**
   * @description 缴费分析-欠费分析
   */
  public async getPropertyPaymentAnalysisArrearsAnalysis (): Promise<{
    "id": number;
    "type": string;
    "minorArrearsAmount": number;
    "seriousArrearsAmount": number;
  }[]> {
    return this.get('/api/pengzhou/rs-payments/statistics/arrears-expense-type')
  }
  /**
   * @description 缴费分析-已缴费统计
   */
  public async getPropertyPaymentAnalysisPaidStatistics (period: string, type: string): Promise<{
    "time": string;
    "count": number;
    "isPeak": false;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/rs-payments/statistics/amount/trend', { period, type })
  }
  /**
   * @description 缴费分析-缴费效率分析
   */
  public async getPropertyPaymentAnalysisPaymentEfficiencyAnalysis (period: string, type: string): Promise<{
    "time": string;
    "count": number;
    "isPeak": false;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/rs-payments/statistics/efficiency-trends', { period, type })
  }
  /**
   * @description 缴费分析-缴费通知成功率分析
   */
  public async getPropertyPaymentAnalysisPaymentNotificationSuccessRateAnalysis (): Promise<{
    "id": number;
    "sendResult": string;
    "count": number;
  }[]> {
    return this.get('/api/pengzhou/rs-payments/statistics/notice-result')
  }
  /**
   * @description 缴费分析-缴费方式统计
   */
  public async getPropertyPaymentAnalysisPaymentMethodStatistics (period: string, type: string): Promise<{
    "type": string;
    "count": number;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/rs-payments/statistics/pay-type', { period, type })
  }
  /**
   * @description 缴费分析-缴费时间段分析
   */
  public async getPropertyPaymentAnalysisPaymentTimePeriodAnalysis (period: string, type: string): Promise<{
    "time": string;
    "count": number;
  }[]> {
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/rs-payments/statistics/time-group/trend', { period, type })
  }

  /**
   * @description 租赁分析-装修申请数量
   */
  public async getPropertyRentAnalysisDecorationApplicationQuantity (): Promise<{
    "month": string;
    "decorationCount": number;
  }[]>{
    return this.get('/api/pengzhou/lease/decoration/statistics')
  }

  /**
   * @description 租赁分析-装修时长分析
   */
  public async getPropertyRentAnalysisDecorationDurationAnalysis (): Promise<{

  }>{
    // 没找到文档
    return this.get('/api/pengzhou/lease/decoration/statistics')
  }

  /**
   * @description 租赁分析-租赁数据统计
   */
  public async getPropertyRentAnalysisLeaseDataStatistics (): Promise<{
    "leaseType": number;
    "leaseTypeCount": number;
  }[]>{
    return this.get('/api/pengzhou/lease/statistics')
  }

  /**
   * @description 租赁分析-租赁数据统计
   */
  public async getPropertyRentAnalysisLease (period: string, type: string): Promise<{
    "time": string;
    "count": number;
    "count2": number;
  }[]>{
    type === 'THIS_QUARTER' && (type = 'THIS_YEAR')
    return this.get('/api/pengzhou/lease/status/trend', { period, type })
  }

  /**
   * @description 租赁分析-入驻企业分析
   */
  public async getPropertyRentAnalysisSettledEnterpriseAnalysis (): Promise<{
    "enterpriseSizeType": number;
    "enterpriseSizeTypeCount": number;
  }[]>{
    return this.get('/api/pengzhou/lease/enterprise/size')
  }

  /**
   * @description 租赁分析-租赁类型分析
   */
  public async getPropertyRentAnalysisLeaseTypeAnalysis (): Promise<{
    "time": string;
    "count": number;
    "count2": number;
    "count3": number;
  }[]>{
    return this.get('/api/pengzhou/lease/type/trend')
  }

  /**
   * @description 租赁分析-租赁企业分析
   */
  public async getPropertyRentAnalysisLeaseEnterpriseAnalysis (): Promise<{
    "enterpriseType": number;
    "enterpriseTypeCount": number;
  }[]>{
    return this.get('/api/pengzhou/lease/enterprise/type')
  }
}