import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { ExamDetailState, ExamQuestion, ExamRecordState, ExamResultState, MarketCultivateTaskInfo, MarketExamTaskInfo, MarketPCUrl, PageResult, PaperState, TrainType, UserInfoState } from './types'
const baseURL = `${BASE_API}/safety-education/public`

/** 安全教育 公共接口 */
export class CubeSecureEduPublicService {
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
    marketTenant?: number;
    tenant: number;
  }): Promise<PageResult<MarketCultivateTaskInfo[]>> {
    const url = `${baseURL}/cultivate-task/page`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<MarketCultivateTaskInfo[]>>>({ url, payload })
    return resp.data||resp
  }

  /** 培训任务详情 */
  public async getCultivateTask (id: string): Promise<{ data: MarketCultivateTaskInfo & { id: string; }; }> {
    const url = `${baseURL}/cultivate-task/${id}`
    const resp = await this.gateway.get<LegacyServiceError<MarketCultivateTaskInfo & { id: string; }>>({ url })
    return resp
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
    tenant?: number | undefined;
    marketTenant?: number | undefined;
  }): Promise<PageResult<MarketExamTaskInfo[]>> {
    const url = `${baseURL}/exam-task/page`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<MarketExamTaskInfo[]>>>({ url, payload })
    return resp.data||resp
  }

  /** 考试任务详情 */
  public async getExamTask (id: string): Promise<{ data: MarketExamTaskInfo & { id: string;examPapers: { id: string;name: string; }[]; chargeUserName: string; }; }> {
    const url = `${baseURL}/exam-task/${id}`
    const resp = await this.gateway.get<LegacyServiceError<MarketExamTaskInfo & { id: string;examPapers: { id: string;name: string; }[]; chargeUserName: string; }>>({ url })
    return resp
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

  /** 获取市场PC外链详情 */
  public async getMarketTaskUrl (payload: { id: string; taskType: 'EXAM_TASK' | 'CULTIVATE_TASK'; }): Promise<MarketPCUrl> {
    const url = '/api/safety-management/public/education/market-task-url/detail'
    const resp = await this.gateway.get<LegacyServiceError<MarketPCUrl>>({ url, payload })
    return resp.data||resp
  }

  /** PC外链 获取主题 */
  public async getThemePage (payload: {
    pageSize: number;
    pageNumber: number;
    tenant: number;
  }): Promise<{ id: string; name: string; }[]> {
    const url = `${baseURL}/themes`
    const resp = await this.gateway.get<LegacyServiceError<{ id: string; name: string; }[]>>({ url, payload })
    return resp.data||resp
  }

  // 获取用户的培训任务分页查询（外链）
  public async getPublicCultivateTask (payload: {
    cultivateTaskStatus?: string;
    keyword?: string;
    marketTenant?: string;
    userIdentify?: string;
  }): Promise<{ total: number;pages: number;records: TrainType[]; }> {
    const url = `${baseURL}/app/cultivate-task/page`
    const resp = await this.gateway.get<LegacyServiceError<{ total: number;pages: number;records: TrainType[]; }>>({ url, payload })
    return resp.data||resp
  }

  // 获取培训任务详情（外链）
  public async getPublicCultivateTaskDetail (payload: {
    id: string;
  }): Promise<TrainType> {
    const url = `${baseURL}/cultivate-task/${payload.id}`
    const data = await this.gateway.get<TrainType>({ url })
    return data
  }

  // 培训签到（外链）
  public async trainSignIn (payload: {
    id: string;
    userIdentify: string;
    userName: string;
    userPhone: string;
    userDepartmentName: string;
    userPostName: string;
  }): Promise<TrainType> {
    const url = `${baseURL}/cultivate-task/${payload.id}/sign`
    const res = await this.gateway.update<LegacyServiceError<TrainType>>({ url, payload })
    return res.data || res
  }

  /**
   * h5获取考试列表
   */
  public async getSafetyExamPage (payload: {
    pageSize: number;
    pageNumber: number;
    examTaskStatus: string;
    keyword: string;
    marketTenant?: number | string;
    tenant?: number | string;
  }): Promise<{ total: number;pages: number;records: Record<string, string | number>[]; }> {
    const url = `${baseURL}/user-exam-task/page`
    const resp = await this.gateway.get<LegacyServiceError<{ total: number;pages: number;records: Record<string, string | number>[]; }>>({ url, payload })
    return resp.data||resp
  }

  /** 获取考试详情 **/
  public async getExamDetail (payload: {
    id: string;
    userIdentify: string | null;
  }): Promise<ExamDetailState> {
    const url = `${baseURL}/exam-task/${payload.id}`
    const resp = await this.gateway.get<LegacyServiceError<ExamDetailState>>({ url, payload })
    return resp.data||resp
  }

  /**
   * 获取考试任务试卷详情
   */
  public async getExamPaperDetail (payload: {
    id: string;
    paperId: string;
  }): Promise<PaperState> {
    const url = `${baseURL}/exam-task/${payload.id}/paper/${payload.paperId}`
    const resp = await this.gateway.get<LegacyServiceError<PaperState>>({ url })
    return resp.data||resp
  }

  /**
   * 获取用户考试试卷
   */
  public async getUserExamPaper (payload: {
    id: string;
    userIdentify: string | null;
  }): Promise<PaperState> {
    const url = `${baseURL}/user-exam-task/${payload.id}/paper`
    const resp = await this.gateway.get<LegacyServiceError<PaperState>>({ url, payload })
    return resp.data||resp
  }

  /** 提交考试任务 */
  public async submitExam (payload: {
    examTaskId: string;
    examPaperId: string;
    examDuration: number;
    examQuestions: ExamQuestion[];
    userInfo: UserInfoState;
  }): Promise<ExamResultState> {
    const url = `${baseURL}/user-exam-task/record/submitted`
    const resp = await this.gateway.create<LegacyServiceError<ExamResultState>>({ url, payload })
    return resp.data||resp
  }

  /** 获取当前任务考试记录(用户) */
  public async getExamTaskRecords (payload: {
    id: string;
    userIdentify: string | null;
  }): Promise<ExamRecordState[]> {
    const url = `${baseURL}/user-exam-task/${payload.id}/records`
    const resp = await this.gateway.get<LegacyServiceError<ExamRecordState[]>>({ url, payload })
    return resp.data||resp
  }

  public async getExamRecordDetail (payload: {
    examTaskId: string;
  }): Promise<PaperState> {
    const url = `${baseURL}/user-exam-task/record/${payload.examTaskId}/paper`
    const resp = await this.gateway.get<LegacyServiceError<PaperState>>({ url })
    return resp.data||resp
  }
}
