import type {
  AlarmSecurityReportVO,
  AlarmTypesResponse,
  GradingAlarmIndicators,
  HistoryList,
  HistoryScore,
  Libraries,
  LibrariesList,
  PageResult,
  ProcessingRate,
  RuleLibraries,
  RuleTemplate,
  ScoreTemplate,
} from "./type";
import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API, type CubeStatPeriodParams, PeriodStatTypeEnum } from "@ghcloud/cube-protocol";
import { type DateUnit, DateUtils } from "@ghcloud/epp";

const baseURL = `${BASE_API}/safety-management`;
const devURL = `${BASE_API}/metric`;
// Const devURL = `${BASE_API}`

/**
 * 安全分析服务
 */
export class CubeSafetyManagementAnalysisService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 获取指标分数 */
  public async getCalculateMetricScore(payload?: {
    requestId?: string | null;
    itemCodeConcat: string;
    period: string;
  }): Promise<ScoreTemplate> {
    const url = `${devURL}/calculate/rule/score`;
    const resp = await this.gateway.create<ScoreTemplate>({
      url,
      payload,
    });
    return resp;
  }
  /** 获取指标内容 */
  public async getCalculateMetricContent(payload?: {
    requestId?: string | null;
    itemCodeConcat: string;
    period: string;
  }): Promise<RuleTemplate> {
    const url = `${devURL}/calculate/rule/content`;
    const resp = await this.gateway.create<RuleTemplate>({
      url,
      payload,
    });
    return resp;
  }
  /** 获取父级应用分数 */
  public async getParentScore(payload?: {
    requestId?: string | null;
    itemCodeConcat: string;
    period: string;
  }): Promise<GradingAlarmIndicators> {
    const url = `${devURL}/calculate/parent/score`;
    const resp = await this.gateway.create<GradingAlarmIndicators>({
      url,
      payload,
    });
    return resp;
  }
  /** 获取AI指标建议 */
  public async getCalculateRuleAI(payload?: {
    requestId?: string | null;
    itemCodeConcat: string;
    period: string;
  }): Promise<GradingAlarmIndicators> {
    const url = `${devURL}/calculate/rule/score/suggestion`;
    const resp = await this.gateway.create<GradingAlarmIndicators>({
      url,
      payload,
    });
    return resp;
  }

  /** 获取应用分数 */
  public async getCalculateAppScore(payload?: {
    requestId?: string | null;
    itemCodeConcat: string;
    period: string;
  }): Promise<{ score: number }> {
    const url = `${devURL}/calculate/app/score`;
    const resp = await this.gateway.create<{ score: number }>({
      url,
      payload,
    });
    return resp;
  }

  /** 获取报告总分 */
  public async getAlarmsScore(payload?: { requestId?: string | null }): Promise<{ score: number; createTime: number }> {
    const url = `${devURL}/calculate/score`;
    const resp = await this.gateway.create<{ score: number; createTime: number }>({
      url,
      payload,
    });
    return resp;
  }
  /** 获取报告总建议 */
  public async getReportsSuggestion(payload?: { requestId?: string | null }): Promise<GradingAlarmIndicators> {
    const url = `${devURL}/safety/reports/suggestion`;
    const resp = await this.gateway.create<GradingAlarmIndicators>({
      url,
      payload,
    });
    return resp;
  }

  /** 获取历史报告数据 */
  public async getAlarmsHistoryScore(payload: { requestId?: string | null }): Promise<HistoryScore> {
    const url = `${devURL}/safety/reports/${payload.requestId}`;
    const resp = await this.gateway.get<HistoryScore>({
      url,
    });
    return resp;
  }
  /** 获取报告列表 */
  public async getAlarmsList(payload?: { pageSize: number; pageNumber: number; keyword?: string | null }): Promise<HistoryList> {
    const url = `${devURL}/safety/reports?pageSize=${payload?.pageSize}&pageNumber=${payload?.pageNumber}&keyword=${payload?.keyword}`;
    const resp = await this.gateway.get<HistoryList>({
      url,
    });
    return resp;
  }
  /** 获取指标库 */
  public async getLibrariesList(payload?: { pageSize: number; pageNumber: number; keyword?: string | null }): Promise<LibrariesList> {
    const url = `${devURL}/metric-libraries?pageSize=${payload?.pageSize}&pageNumber=${payload?.pageNumber}&keyword=${payload?.keyword}`;
    const resp = await this.gateway.get<LibrariesList>({
      url,
    });
    return resp;
  }
  /** 获取全部指标库 */
  public async getLibrariesAllList(): Promise<Libraries[]> {
    const url = `${devURL}/metric-libraries/all`;
    const resp = await this.gateway.get<Libraries[]>({
      url,
    });
    return resp;
  }
  /** 指标新增 */
  public async postLibrariesList(payload?: {
    name: string;
    computeFormula: string;
    computeFormulaMetrics: string;
    computeType: string;
  }): Promise<boolean> {
    const url = `${devURL}/metric-libraries`;
    const resp = await this.gateway.create<boolean>({
      url,
      payload,
    });
    return resp;
  }
  /** 指标编辑 */
  public async putLibrariesList(payload?: {
    id: string;
    name: string;
    computeFormula: string;
    computeFormulaMetrics: string;
    computeType: string;
  }): Promise<boolean> {
    const url = `${devURL}/metric-libraries`;
    const resp = await this.gateway.update<boolean>({
      url,
      payload,
    });
    return resp;
  }
  /** 指标删除 */
  public async deleteLibrariesList(payload?: { id: string }): Promise<void> {
    const url = `${devURL}/metric-libraries/${payload?.id}`;
    await this.gateway.delete({
      url,
      payload,
    });
  }
  /** 规则库列表 */
  public async getRuleLibrariesList(): Promise<RuleLibraries[]> {
    const url = `${devURL}/rule-libraries/tree`;
    const resp = await this.gateway.get<RuleLibraries[]>({
      url,
    });
    return resp;
  }
  /** 新增规则 */
  public async postRuleLibrariesList(payload?: {
    itemName: string;
    itemCode?: string;
    parentId?: string;
    itemType: string;
    weightAllot?: number;
    computeMetric?: string;
    ruleContentTemplate?: string;
    ruleContentTemplateEnabled?: boolean;
    templateMetricVariables?: string;
    displayMetricsEnabled?: boolean;
    displayMetrics?: string;
    coefficients?: { greaterThan: string; lessThanOrEqual: string; scoreRatio: string }[];
  }): Promise<boolean> {
    const url = `${devURL}/rule-libraries`;
    const resp = await this.gateway.create<boolean>({
      url,
      payload,
    });
    return resp;
  }
  /** 编辑规则 */
  public async editRuleLibrariesList(payload?: {
    id?: string;
    itemName: string;
    itemCode?: string;
    parentId?: string;
    itemType: string;
    weightAllot?: number;
    computeMetric?: string;
    ruleContentTemplate?: string;
    ruleContentTemplateEnabled?: boolean;
    templateMetricVariables?: string;
    displayMetricsEnabled?: boolean;
    displayMetrics?: string;
    coefficients?: { greaterThan: string; lessThanOrEqual: string; scoreRatio: string }[];
  }): Promise<boolean> {
    const url = `${devURL}/rule-libraries`;
    const resp = await this.gateway.update<boolean>({
      url,
      payload,
    });
    return resp;
  }
  /** 规则删除 */
  public async deleteRuleLibrariesList(payload?: { id: string }): Promise<void> {
    const url = `${devURL}/rule-libraries/${payload?.id}`;
    await this.gateway.delete({
      url,
      payload,
    });
  }
}
