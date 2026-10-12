import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { HeadQuartersCultivateTaskInfo, HeadQuartersCultivateTaskRecord, HeadQuartersCultivateUserRecord, HeadQuartersExamTaskInfo, MarketPCUrl, PageResult, PaperState } from './types'
const baseURL = `${BASE_API}/safety-education/headquarters`

/** 安全教育 总部服务 */
export class CubeSecureEduHeadQuartersService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 培训任务分页查询 */
  public async getCultivateTaskPage (payload: {
    pageSize: number;
    pageNumber: number;
    /**
     * 培训形式
     */
    cultivateMode?: string | undefined;
    /**
     * 培训对象
     */
    cultivateTarget?: string | undefined;
    /**
     * 培训任务状态
     */
    cultivateTaskStatus?: string | undefined;
    /**
     * 关键字
     */
    keyword?: string | undefined;
    /**
     * 培训时间段
     */
    period?: string;
    /**
     * 培训主题
     */
    themeId?: string | undefined;
  }): Promise<PageResult<HeadQuartersCultivateTaskRecord[]>> {
    const url = `${baseURL}/cultivate-task/page`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<HeadQuartersCultivateTaskRecord[]>>>({ url, payload })
    return resp.data||resp
  }

  /** 添加培训任务 */
  public async addCultivateTask (params: HeadQuartersCultivateTaskInfo): Promise<void> {
    const url = `${baseURL}/cultivate-task`
    const payload = params as unknown as Record<string, unknown>
    await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
  }

  /** 培训任务详情 */
  public async getCultivateTask (id: string): Promise<{ data: HeadQuartersCultivateTaskInfo & { id: string; }; }> {
    const url = `${baseURL}/cultivate-task/${id}`
    const resp = await this.gateway.get<LegacyServiceError<HeadQuartersCultivateTaskInfo & { id: string; }>>({ url })
    return resp
  }

  /** 更新培训任务 */
  public async updateCultivateTask (params: HeadQuartersCultivateTaskInfo & { id: string; }): Promise<void> {
    const url = `${baseURL}/cultivate-task/${params.id}`
    const payload = params as unknown as Record<string, unknown>
    await this.gateway.update<LegacyServiceError<unknown>>({ url, payload })
  }

  /** 删除培训任务 */
  public async deleteCultivateTask (id: string): Promise<void> {
    const url = `${baseURL}/cultivate-task/${id}`
    await this.gateway.delete({ url })
  }

  /** 修改培训状态（适用于：发布、撤回等） */
  public async changeCultivateTaskStatus (id: string, status: string): Promise<void> {
    const url = `${baseURL}/cultivate-task/${id}/update/${status}`
    await this.gateway.update({ url })
  }

  /** 考试后任务分页查询 */
  public async getExamTaskPage (payload: {
    pageSize: number;
    pageNumber: number;
    /**
       * 培训形式
       */
    cultivateMode?: string | undefined;
    /**
       * 考试类型
       */
    examTaskType?: string | undefined;
    /**
       * 考试任务状态
       */
    examTaskStatus?: string | undefined;
    /**
       * 关键字
       */
    keyword?: string | undefined;
    /**
       * 培训时间段
       */
    period?: string;
    /**
       * 培训主题
       */
    themeId?: string | undefined;
  }): Promise<PageResult<HeadQuartersCultivateTaskRecord[]>> {
    const url = `${baseURL}/exam-task/page`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<HeadQuartersCultivateTaskRecord[]>>>({ url, payload })
    return resp.data||resp
  }

  /** 添加考试任务 */
  public async addExamTask (params: HeadQuartersExamTaskInfo): Promise<void> {
    const url = `${baseURL}/exam-task`
    const payload = params as unknown as Record<string, unknown>
    await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
  }

  /** 更新考试任务 */
  public async updateExamTask (params: HeadQuartersExamTaskInfo & { id: string; }): Promise<void> {
    const url = `${baseURL}/exam-task/${params.id}`
    const payload = params as unknown as Record<string, unknown>
    await this.gateway.update<LegacyServiceError<unknown>>({ url, payload })
  }

  /** 考试任务详情 */
  public async getExamTask (id: string): Promise<{ data: HeadQuartersExamTaskInfo & { id: string;examPapers: { id: string;name: string; }[]; chargeUserName: string; }; }> {
    const url = `${baseURL}/exam-task/${id}`
    const resp = await this.gateway.get<LegacyServiceError<HeadQuartersExamTaskInfo & { id: string;examPapers: { id: string;name: string; }[]; chargeUserName: string; }>>({ url })
    return resp
  }

  /** 删除培训任务 */
  public async deleteExamTask (id: string): Promise<void> {
    const url = `${baseURL}/exam-task/${id}`
    await this.gateway.delete({ url })
  }

  /** 考试任务 发布 */
  public async publishExamTask (id: string): Promise<void> {
    const url = `${baseURL}/exam-task/published/${id}`
    await this.gateway.update({ url })
  }

  /** 考试任务 撤回 */
  public async withdrawExamTask (id: string): Promise<void> {
    const url = `${baseURL}/exam-task/withdraw/${id}`
    await this.gateway.update({ url })
  }

  /** 获取市场PC外链 */
  public async getMarketTaskUrlPage (payload: {
    keyword?: string;
    pageSize: number;
    pageNumber: number;
    taskType?: string;
  }): Promise<PageResult<MarketPCUrl[]>> {
    const url = '/api/safety-management/education/market-task-urls'
    const resp = await this.gateway.get<LegacyServiceError<PageResult<MarketPCUrl[]>>>({ url, payload })
    return resp.data||resp
  }

  /** 修改PC外链的状态 */
  public async changeMarketPCLinkEnable (id: string, enabled: boolean): Promise<void> {
    const url = `/api/safety-management/education/market-task-url/${id}/${enabled}`
    await this.gateway.update({ url })
  }

  /** 培训记录 */
  public async geCultivateUserRecordsPage (payload: {
    /**
     * 是否迟到,true迟到,false:正常
     */
    belated?: boolean | undefined;
    /**
 * 培训形式
 */
    cultivateMode?: string | undefined;
    /**
 * 培训任务主键
 */
    cultivateTaskId?: string | undefined;
    /**
 * 市场租户编号
 */
    marketTenant?: string | undefined;
    /**
 * 页大小
 */
    pageNumber: number;
    /**
 * 页码
 */
    pageSize: number;
    /**
 * 时间范围
 */
    period?: string;
    /**
 * 主题主键
 */
    themeId?: string | undefined;
    /**
 * 签到状态   SIGNED("已签"),UNSIGNED("未签");
 */
    userSignStatus?: string | undefined;
  }): Promise<PageResult<HeadQuartersCultivateUserRecord[]>> {
    const url = `${baseURL}/cultivate-user/records`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<HeadQuartersCultivateUserRecord[]>>>({ url, payload })
    return resp.data||resp
  }

  /** 考试记录 */
  public async geExamUserRecordsPage (payload: {
    /**
     * 考试状态    STAY_EXAM(0,"待考试"),EXAMINED(2,"已考试"),MISS_EXAM(1,"缺考")
     */
    examStatus?: string | undefined;
    /**
 * 考试任务主键
 */
    examTaskId?: string | undefined;
    /**
 * 考试类型    STAFF_EXAM("员工考核"), MERCHANT_EXAM("商户考核");
 */
    examTaskType?: string | undefined;
    /**
 * 关键字
 */
    keyword?: string;
    /**
 * 市场租户编号
 */
    marketTenant?: number | undefined;
    /**
 * 页大小
 */
    pageSize: number;
    /**
 * 页码
 */
    pageNumber: number;
    /**
 * 是否及格，true:及格，false:不及格
 */
    passed?: boolean | undefined;
    /**
 * 时间范围
 */
    period?: string | undefined;
    /**
 * 主题
 */
    themeId?: string | undefined;

  }): Promise<PageResult<unknown[]>> {
    const url = `${baseURL}/exam-user/records`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<unknown[]>>>({ url, payload })
    return resp.data||resp
  }

  /** 导出培训用户记录 */
  public async exportCultivateUserRecords (payload: {
    /**
     * 是否迟到
     */
    belated?: string | undefined;
    /**
 * 培训形式
 */
    cultivateMode?: string | undefined;
    /**
 * 培训任务主键
 */
    cultivateTaskId?: string | undefined;
    /**
 * 市场租户编号
 */
    marketTenant?: string | undefined;
    /**
 * 签到时间
 */
    period?: string | undefined;
    /**
 * 主题主键
 */
    themeId?: string | undefined;
    /**
 * 签到状态
 */
    userSignStatus?: string | undefined;
  }): Promise<Blob> {
    const url = `${baseURL}/cultivate-user/records/export`
    return this.gateway.customBlob({ method: 'POST', url, payload })
  }

  /** 导出考试用户记录 */
  public async exportExamUserRecords (payload: {
    /**
     * 考试状态
     */
    examStatus?: string | undefined;
    /**
      * 考试任务主键
      */
    examTaskId?: string | undefined;
    /**
      * 考试类型
      */
    examTaskType?: string | undefined;
    /**
      * 关键字
      */
    keyword?: string;
    /**
      * 市场租户编号
      */
    marketTenant?: string | undefined;
    /**
      * 是否及格
      */
    passed?: boolean | undefined;
    /**
      * 考试日期
      */
    period?: string | undefined;
    /**
      * 主题
      */
    themeId?: string | undefined;
  }): Promise<Blob> {
    const url = `${baseURL}/exam-user/records/export`
    return this.gateway.customBlob({ method: 'POST', url, payload })
  }

  /**
   * 总部 获取考试任务试卷详情
   */
  public async getExamPaperDetail (payload: {
    id: string;
    examPaperId: string;
  }): Promise<PaperState> {
    const url = `${baseURL}/exam-task/${payload.id}/paper/${payload.examPaperId}`
    const resp = await this.gateway.get<LegacyServiceError<PaperState>>({ url })
    return resp.data||resp
  }
}
