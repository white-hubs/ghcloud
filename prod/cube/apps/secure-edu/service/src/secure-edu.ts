import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { ExamDetailState, ExamRecordState, PaperState, ExamQuestion, ExamResultState, TrainType, CultivateTaskStat, ExamTaskStat, CultivateTaskTrainUserStat, UserInfoState, ImportExamQuestionVO } from './types'

const baseURL = `${BASE_API}/safety-education`

interface SafetyCultivateRecord {
  /**
     * 培训日期
     */
  cultivateDate?: null | string;
  /**
       * 培训时长(分钟)
       */
  cultivateDuration?: number | null;
  /**
       * 培训类型
       */
  cultivateType?: null | string;
  /**
       * 实体id
       */
  objId: string | null;
  /**
       * 参与人数
       */
  personNum?: number | null;
  /**
       * 现场照片
       */
  photo?: null | string;
  /**
       * 培训主题
       */
  themeName: string;
  photoFiles: { path: string; }[];
  id: string;
  createBy: string;
  createTime: string;
}

/** 安全教育服务 */
export class CubeSecureEduService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 二维码中转页 提交 */
  public async saveSafetyCultivate (payload: {
    /**
       * 培训日期
       */
    cultivateDate?: null | string;
    /**
         * 培训时长(分钟)
         */
    cultivateDuration?: number | null;
    /**
         * 培训类型
         */
    cultivateType?: null | string;
    /**
         * 实体id
         */
    objId: string | null;
    /**
         * 参与人数
         */
    personNum?: number | null;
    /**
         * 现场照片
         */
    photo?: null | string;
    /**
         * 培训主题
         */
    themeName: string;
  }
  ): Promise<unknown> {
    const url = `${baseURL}/safetyCultivate/save`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data||resp
  }

  /** 二维码中转页统计下钻 分页 */
  public async getSafetyCultivatePage (payload: {
    pageSize: number;
    pageNumber: number;
    objId: string;
  }): Promise<{ total: number;pages: number;records: SafetyCultivateRecord[]; }> {
    const url = `${baseURL}/safetyCultivate/page`
    const resp = await this.gateway.get<LegacyServiceError<{ total: number;pages: number;records: SafetyCultivateRecord[]; }>>({ url, payload })
    return resp.data||resp
  }

  /** 统计接口 - 培训统计 */
  public async getCultivateTaskStat (payload: {
    period: string;
  }): Promise<CultivateTaskStat> {
    const url = `${baseURL}/cultivate-task/stat`
    const resp = await this.gateway.get<LegacyServiceError<CultivateTaskStat>>({ url, payload })
    return resp.data||resp
  }

  /** 统计接口 - 培训人员统计 */
  public async getCultivateTaskTrainUserStat (payload: {
    period: string;
  }): Promise<CultivateTaskTrainUserStat> {
    const url = `${baseURL}/cultivate-task/trainUser/stat`
    const resp = await this.gateway.get<LegacyServiceError<CultivateTaskTrainUserStat>>({ url, payload })
    return resp.data||resp
  }

  /** 统计接口 - 考试任务统计(数量,环比 不及格,缺考) */
  public async getExamTaskStat (payload: {
    period: string;
  }): Promise<ExamTaskStat> {
    const url = `${baseURL}/exam-task-statistics`
    const resp = await this.gateway.get<LegacyServiceError<ExamTaskStat>>({ url, payload })
    return resp.data||resp
  }

  /** 考试列表 */
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
  }): Promise<ExamDetailState> {
    const url = `${baseURL}/exam-task/${payload.id}`
    const resp = await this.gateway.get<LegacyServiceError<ExamDetailState>>({ url })
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
  }): Promise<PaperState> {
    const url = `${baseURL}/user-exam-task/${payload.id}/paper`
    const resp = await this.gateway.get<LegacyServiceError<PaperState>>({ url })
    return resp.data||resp
  }

  /** 获取当前任务考试记录(用户) */
  public async getExamTaskRecords (payload: {
    id: string;
  }): Promise<ExamRecordState[]> {
    const url = `${baseURL}/user-exam-task/${payload.id}/records`
    const resp = await this.gateway.get<LegacyServiceError<ExamRecordState[]>>({ url })
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

  /** 获取考试记录详情 */
  public async getExamRecordDetail (payload: {
    examTaskId: string;
  }): Promise<PaperState> {
    const url = `${baseURL}/user-exam-task/record/${payload.examTaskId}/paper`
    const resp = await this.gateway.get<LegacyServiceError<PaperState>>({ url })
    return resp.data||resp
  }

  // 获取培训任务分页查询
  public async getCultivateTask (payload: {
    cultivateTaskStatus?: string;
    keyword?: string;
  }): Promise<{ total: number;pages: number;records: TrainType[]; }> {
    const url = `${baseURL}/app/cultivate-task/page`
    const resp = await this.gateway.get<LegacyServiceError<{ total: number;pages: number;records: TrainType[]; }>>({ url, payload })
    return resp.data||resp
  }

  // 获取培训任务详情
  public async getCultivateTaskDetail (payload: {
    id: string;
  }): Promise<TrainType> {
    const url = `${baseURL}/cultivate-task/${payload.id}`
    const data = await this.gateway.get<TrainType>({ url })
    return data
  }

  // 培训签到
  public async trainSignInApp (payload: {
    id: string;
    userIdentify: string;
    userName: string;
    userPhone: string;
    userDepartmentName: string;
    userPostName: string;
  }): Promise<TrainType> {
    const url = `${baseURL}/cultivate-task/${payload.id}/sign`
    const { data } = await this.gateway.update<LegacyServiceError<TrainType>>({ url, payload })
    return data
  }

  /** 考题库模板下载 */
  public async exportExamQuestionTemplate (): Promise<Blob> {
    const url = `${baseURL}/exam-question-bank/template`
    const resp = await this.gateway.customBlob({
      url,
      method: 'GET'
    })
    return resp
  }

  /** 考题库导入 */
  public async importExamQuestion (payload: {
    file: Blob | null;
  }): Promise<ImportExamQuestionVO> {
    const url = `${baseURL}/exam-question-bank/import`
    const form = new FormData()
    form.append('file', payload.file)
    const resp = await this.gateway.custom<LegacyServiceError<ImportExamQuestionVO>>({
      url,
      payload: form,
      method: 'POST'
    })
    return resp.data||resp
  }

  /** 下载考题库导入错误数据 */
  public async exportExamQuestionError (payload: Record<string, unknown>[]): Promise<unknown> {
    const url = `${baseURL}/exam-question-bank/error/export`
    const resp = await this.gateway.customBlob({
      url,
      method: 'POST',
      payload
    })
    return resp
  }
}
