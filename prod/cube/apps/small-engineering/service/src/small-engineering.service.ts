import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import type {
  FeedbackDetailRecord,
  ProjectApplyListVO,
  ProjectDetail,
  ProjectNode,
  FeedbackDetailVo,
  ProjectReformVO,
  TemporaryPatrolRecordVO,
} from "./type";
const baseURL = `${BASE_API}/loose-works`;
/**
 * 数量
 *
 * ProjectStatisticsVO
 */
export interface ProjectHomeStatistics {
  /**
   * 异常数
   */
  abnormal?: number | null;
  /**
   * 请示中
   */
  apply?: number | null;
  /**
   * 已完成
   */
  completed?: number | null;
  /**
   * 正常数
   */
  normal?: number | null;
  /**
   * 环比
   */
  ringRatio?: number | null;
  /**
   * 签约中
   */
  signing?: number | null;
  /**
   * 小散工程数
   */
  total?: number | null;
  /**
   * 进行中
   */
  underway?: number | null;
  /**
   * 待验收
   */
  waitAccept?: number | null;
}
export interface ReformRankList {
  projectName: string;
  projectScheduleId: string;
  status: string;
}

export interface ProjectReformAnalysis {
  reformNum: number;
  reformChainRatio: number;
  reformRankList: ReformRankList[];
}
export interface ProjectScheduleListRecord {
  id: string;
  projectNum: string;
  projectName: string;
  partyB: string;
  completionTime: number;
  depName: string;
  superviseUserName: string;
  userId: string;
  projectType?: string;
  projectTypeName?: string;
  status: string;
  statusCode: string;
  constructionSite?: string;
  schedule: number;
  acceptanceUserName: string;
  acceptanceTime: number;
  acceptanceResult: string;
}

export interface ProjectScheduleList {
  total: number;
  pages: number;
  records: ProjectScheduleListRecord[];
}

export interface ScheduleFile {
  id: string;
  name: string;
  suffix: string;
  path: string;
  size: number;
  refCount: number;
  type: string;
  businessKey?: unknown;
  endpointPath: string;
  createTime: number;
}

export interface ProjectScheduleDetail {
  id: string;
  projectName: string;
  status: string;
  statusCode: string;
  constructB: string;
  partyB: string;
  overTime?: unknown;
  depName: string;
  depId?: unknown;
  username: string;
  completionTime: number;
  remarks: string;
  superviseDepId: string;
  constructionSite: string;
  superviseDepName: string;
  duration: string;
  userId: string;
  projectType: string;
  schedule: number;
  scheduleRemark: string;
  hasProblem: boolean;
  scheduleFiles: ScheduleFile[];
  checkAcceptResult: string;
  checkAcceptRemark: string;
  superviseUser: { id: string; name: string }[];
  safetyDockUser: { id: string; name: string }[];
  superviseDepList: { id: string; name: string }[];
  checkFiles: unknown[];
  projectFiles?: ScheduleFile[];
  projectTypeName?: string;
}
export interface ProjectScheduleTrackDownList {
  id: string;
  recordTime: number;
  username: string;
  depName: string;
  operation: string;
  operationCode: "FEEDBACK" | "CHECK_ACCEPT";
  feedbackContent: string;
  checkAcceptContent: string;
  acceptanceResult: string;
}
/**
 * 工程类型模型
 */
export interface EngineeringTypeModel {
  id?: string | null;
  name?: string | null;
}

/**
 * 工程类型分页模型
 */
export interface EngineeringTypeModelPageListModel {
  total: number;
  pages: number;
  records: EngineeringTypeModel[];
}

export class CubeSmallEngineeringService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 小散工程-工程数统计 */
  public async projectHomeStatistics(payload?: {
    type?: string;
    keyword?: string | undefined;
    period?: string | undefined;
  }): Promise<ProjectHomeStatistics> {
    const url = `${baseURL}/project/home/statistics`;
    const resp = await this.gateway.get<LegacyServiceError<ProjectHomeStatistics>>({ url, payload });
    return resp.data || resp;
  }

  /** 工程进度跟踪列表 */
  public async projectScheduleList(payload: {
    pageNumber?: number;
    pageSize?: number;
    keyword?: string | undefined;
    period?: string | undefined;
    status?: string | undefined;
    depId?: string | undefined;
  }): Promise<ProjectScheduleList> {
    const url = `${baseURL}/project/schedule/list`;
    const resp = await this.gateway.get<LegacyServiceError<ProjectScheduleList>>({ url, payload });
    return resp.data || resp;
  }

  /** 工程进度反馈 */
  public async projectScheduleFeedback(payload: {
    scheduleId: string;
    schedule: string;
    fileIds?: string[];
    hasProblem?: boolean;
    description?: string;
    problemDes?: string;
  }): Promise<ProjectScheduleList> {
    const url = `${baseURL}/project/schedule/feedback`;
    const resp = await this.gateway.create<LegacyServiceError<ProjectScheduleList>>({ url, payload });
    return resp.data || resp;
  }

  /** 工程进度反馈 */
  public async projectScheduleCheckAccept(payload: {
    scheduleId: string;
    fileIds?: string[];
    acceptanceResult?: string;
    description?: string;
  }): Promise<ProjectScheduleList> {
    const url = `${baseURL}/project/schedule/checkAccept`;
    const resp = await this.gateway.create<LegacyServiceError<ProjectScheduleList>>({ url, payload });
    return resp.data || resp;
  }

  /** 工程进度详情 */
  public async projectScheduleDetail(id: string): Promise<ProjectScheduleDetail> {
    const url = `${baseURL}/project/schedule/detail/${id}`;
    const resp = await this.gateway.get<LegacyServiceError<ProjectScheduleDetail>>({ url });
    return resp.data || resp;
  }

  /** 跟踪记录列表 */
  public async projectScheduleTrackDownList(id: string): Promise<ProjectScheduleTrackDownList[]> {
    const url = `${baseURL}/project/schedule/${id}/trackDownList`;
    const resp = await this.gateway.get<LegacyServiceError<ProjectScheduleTrackDownList[]>>({ url });
    return resp.data || resp;
  }

  /** 小散工程-缺失经纬度时更新经纬度 */
  public async updateProjectScheduleLatAndLonIfAbsent(payload: { id: string; latAndLon: string; location: string }): Promise<void> {
    const url = `${baseURL}/project/schedule/updateLatAndLonIfAbsent`;
    await this.gateway.update<LegacyServiceError<void>>({ url, payload });
  }

  /** 工程详情-工程反馈列表 */
  public async getFeedbackByScheduleId(payload: { feedbackType: string; scheduleId: string }): Promise<FeedbackDetailRecord[]> {
    const url = `${baseURL}/project/feedback/by/schedule/id`;
    const resp = await this.gateway.get<FeedbackDetailRecord[]>({ url, payload });
    return resp;
  }

  /** 小散工程统计 */
  public async projectStatistics(payload?: { keyword?: string | undefined; period?: string | undefined }): Promise<ProjectHomeStatistics> {
    const url = `${baseURL}/project/statistics`;
    const resp = await this.gateway.get<LegacyServiceError<ProjectHomeStatistics>>({ url, payload });
    return resp.data || resp;
  }

  /** 工程详情 */
  public async getProjectDetail(processInsId: string): Promise<ProjectDetail> {
    const url = `${baseURL}/project/detail/${processInsId}`;
    const resp = await this.gateway.get<LegacyServiceError<ProjectDetail>>({ url });
    return resp.data || resp;
  }

  /** 工程类型列表 */
  public async getProjectTypeList(payload?: { name?: string }): Promise<{ id: string; name: string }[]> {
    const url = `${baseURL}/project-type/list`;
    const resp = await this.gateway.get<{ id: string; name: string }[]>({ url, payload });
    return resp;
  }

  /** 新增工程监管 */
  public async createProjectSupervise(payload: Record<string, unknown>): Promise<string> {
    const url = `${baseURL}/project/schedule/save`;
    const resp = await this.gateway.create<LegacyServiceError<string>>({ url, payload });
    return resp.data || resp;
  }

  /** 删除工程监管 */
  public async deleteProjectSupervise(payload: string[]): Promise<boolean> {
    const url = `${baseURL}/project/schedule/delete`;
    const resp = await this.gateway.custom<boolean>({ url, payload, method: "POST" });
    return resp;
  }

  /**
   * 编辑工程监管
   */
  public async updateProjectSupervise(payload: Record<string, unknown>): Promise<unknown> {
    const url = `${baseURL}/project/schedule/edit`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }

  /**
   * 获取反馈详情
   */
  public async getFeedbackDetail(payload: { id: string }): Promise<FeedbackDetailVo> {
    const url = `${baseURL}/project/feedback/get/by/id`;
    const resp = await this.gateway.get<FeedbackDetailVo>({ url, payload });
    return resp;
  }

  /** 工程类型分页API */
  public async engineeringTypePageList(payload: { pageNumber?: number; pageSize?: number }): Promise<EngineeringTypeModelPageListModel> {
    const url = `${baseURL}/project-type/page`;
    const response = await this.gateway.get<EngineeringTypeModelPageListModel>({ url, payload });
    return response;
  }

  /** (新增/修改)工程类型 */
  public async engineeringTypeEdit(payload: { id?: string; name: string }): Promise<unknown> {
    const url = `${baseURL}/project-type/save-or-update`;
    const response = await this.gateway.create<unknown>({ url, payload });
    return response;
  }

  /** 删除工程类型 */
  public async engineeringTypeDelete(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/project-type/delete`;
    await this.gateway.delete({ url, payload });
  }

  /** 工程管理列表-所有 */
  public async getProjectNodeList(payload: {
    pageNumber: number;
    pageSize: number;
    keyword?: string | undefined;
    period?: string | undefined;
  }): Promise<{ pages: number; total: number; records: ProjectNode[] }> {
    const url = `${baseURL}/project/apply/nodeList`;
    const resp = await this.gateway.get<LegacyServiceError<{ pages: number; total: number; records: ProjectNode[] }>>({ url, payload });
    return resp.data || resp;
  }

  /** 工程管理列表-请示中、签约中 */
  public async getProjectApplyList(payload: {
    applicationCode?: string;
    businessType: string;
    organizationId?: number;
    pageNumber: number;
    pageSize: number;
    processInstanceIds?: string;
    keyword?: string | undefined;
    submitTime?: string | undefined;
    /**
     * 整改对象id
     */
    projectScheduleId?: string;
    startUserId?: number;
    status?: string;
    type?: string;
    username?: string;
  }): Promise<{ pages: number; total: number; records: ProjectApplyListVO[] }> {
    const url = `${baseURL}/project/apply/list`;
    const resp = await this.gateway.get<LegacyServiceError<{ pages: number; total: number; records: ProjectApplyListVO[] }>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  /** 小散工程整改列表 */
  public async getProjectReformList(payload: {
    pageNumber: number;
    pageSize: number;
    businessType: string;
    status?: string;
    keyword?: string | undefined;
    submitTime?: string | undefined;
  }): Promise<{ pages: number; total: number; records: ProjectReformVO[] }> {
    const url = `${baseURL}/project/reform/list`;
    return this.gateway.get<{ pages: number; total: number; records: ProjectReformVO[] }>({ url, payload });
  }

  /** 小散工程-工程整改数 */
  public async getProjectReformAnalysis(payload: {
    pageNumber: number;
    pageSize: number;
    period?: string | undefined;
  }): Promise<ProjectReformAnalysis> {
    const url = `${baseURL}/project/reform/analysis`;
    return this.gateway.get<ProjectReformAnalysis>({ url, payload });
  }

  /**
   * 小散工程-临时巡查
   */
  public async temporaryPatrolAdd(payload: Record<string, unknown>): Promise<unknown> {
    const url = `${baseURL}/project/inspect/record/submit`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }

  /**
   * 小散工程-临时巡查记录
   */
  public async temporaryPatrolRecord(payload: {
    pageNumber: number;
    pageSize: number;
    keyword?: string | undefined;
    period?: string | undefined;
  }): Promise<{ pages: number; total: number; records: TemporaryPatrolRecordVO[] }> {
    const url = `${baseURL}/project/inspect/record/page`;
    const resp = await this.gateway.get<{ pages: number; total: number; records: TemporaryPatrolRecordVO[] }>({ url, payload });
    return resp;
  }

  /**
   * 小散工程-临时巡查详情
   */
  public async temporaryPatrolDetails(id: string): Promise<TemporaryPatrolRecordVO> {
    const url = `${baseURL}/project/inspect/record/detail`;
    const resp = await this.gateway.get<TemporaryPatrolRecordVO>({ url, payload: { id } });
    return resp;
  }

  /**
   * 小散工程-是否存在异常
   */
  public async projectIsAbnormal(id: string): Promise<string> {
    const url = `${baseURL}/project/inspect/record/abnormal`;
    const resp = await this.gateway.get<string>({ url, payload: { id } });
    return resp;
  }
}
