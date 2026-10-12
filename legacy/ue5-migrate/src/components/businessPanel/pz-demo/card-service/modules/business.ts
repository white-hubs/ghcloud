import { PZBaseCardService } from '../base-card-service'

/**
 * @description 彭州招商运营卡片服务
 */
export class PZBusinessService extends PZBaseCardService{
  /**
   * @description 在线预约概览
   */
  public async getOnlineAppointmentOverview (): Promise<OnlineBookRecordVO[]> {
    return this.get('/api/pengzhou/ioc/operation/online-book-record/get')
  }
  /**
   * @description 咨询统计
   */
  public async getConsultationStatistics (): Promise<ConsultingStatisticsPO> {
    return this.get('/api/pengzhou/ioc/operation/consulting-statistics/get')
  }

  /**
   * @description 咨询服务记录
   */
  public async getConsultationServiceRecord (): Promise<AdvisoryServiceRecordVO[]> {
    return this.get('/api/pengzhou/ioc/operation/consulting-record/get')
  }
}
export interface OnlineBookRecordVO {
  /**
   * 预约时间
   */
  bookTime?: string;
  /**
   * 预约类型
   */
  bookType?: string;
  /**
   * 预约企业
   */
  enterpriseName?: string;
}
export interface ConsultingStatisticsPO {
  /**
   * 咨询问题数
   */
  consultingQuestionNum?: number;
  createBy?: string;
  createTime?: string;
  deleted?: boolean;
  id?: number;
  /**
   * 分享资料数
   */
  shareMaterialNum?: number;
  tenant?: number;
  updateBy?: string;
  updateTime?: string;
  /**
   * 用户反馈数
   */
  userFeedbackNum?: number;
}
export interface AdvisoryServiceRecordVO {
  /**
   * 咨询类型
   */
  advisoryType?: string;
  /**
   * 服务时间
   */
  serviceTime?: string;
  /**
   * 服务对象名称
   */
  serviceUser?: string;
}