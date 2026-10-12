import type { CubeAuth, LegacyServiceError } from "@ghcloud/cube-gateway";
import { CubeGateway } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import type {
  CreditWeightSuggestionInput,
  CreditWeightSuggestionOutput,
  PageResult,
  SafetyCreditArchiveDetailVO,
  SafetyCreditArchiveOperationCommand,
  SafetyCreditArchivePageQuery,
  SafetyCreditArchiveSummaryVO,
  SafetyCreditArchiveVO,
  SafetyCreditBenefitRecordCreateCommand,
  SafetyCreditBenefitRecordOperateCommand,
  SafetyCreditBenefitRecordPageQuery,
  SafetyCreditBenefitRecordVO,
  SafetyCreditBenefitRuleCommand,
  SafetyCreditBenefitRulePageQuery,
  SafetyCreditBenefitRuleVO,
  SafetyCreditBehaviorAuditPageQuery,
  SafetyCreditBehaviorPageQuery,
  SafetyCreditBehaviorRejectCommand,
  SafetyCreditBehaviorVO,
  SafetyCreditCheckExecutionEnsureCommand,
  SafetyCreditCheckExecutionSubmitCommand,
  SafetyCreditCheckExecutionVO,
  SafetyCreditCheckQualityPageQuery,
  SafetyCreditCheckQualityReviewCommand,
  SafetyCreditCheckQualitySummaryVO,
  SafetyCreditCheckQualityVO,
  SafetyCreditCheckStatisticsSummaryVO,
  SafetyCreditChecklistGenerateCommand,
  SafetyCreditChecklistPageQuery,
  SafetyCreditChecklistSaveCommand,
  SafetyCreditChecklistVO,
  SafetyCreditDataSourceCommand,
  SafetyCreditDataSourceEnabledCommand,
  SafetyCreditDataSourcePageQuery,
  SafetyCreditDataSourceVO,
  SafetyCreditEventMappingsCommand,
  SafetyCreditEventMappingVO,
  SafetyCreditManualBehaviorCommand,
  SafetyCreditMerchantBehaviorPageQuery,
  SafetyCreditMerchantCommand,
  SafetyCreditMerchantImportResultVO,
  SafetyCreditMerchantPageQuery,
  SafetyCreditMerchantScoreSummaryVO,
  SafetyCreditMerchantVO,
  SafetyCreditOuaaAppointmentVO,
  SafetyCreditOuaaApplicationPageQuery,
  SafetyCreditOuaaApplicationVO,
  SafetyCreditOuaaOrganizationVO,
  SafetyCreditOuaaPositionVO,
  SafetyCreditOuaaRoleVO,
  SafetyCreditOuaaUserPageQuery,
  SafetyCreditOuaaUserVO,
  SafetyCreditPublicityConfigCommand,
  SafetyCreditPublicityConfigVO,
  SafetyCreditRankingPageQuery,
  SafetyCreditRankingSummaryQuery,
  SafetyCreditRankingSummaryVO,
  SafetyCreditRankingVO,
  SafetyCreditScoreLogPageQuery,
  SafetyCreditScoreLogVO,
  SafetyCreditScoreModelCommand,
  SafetyCreditScoreModelPageQuery,
  SafetyCreditScoreModelVersionVO,
  SafetyCreditScoreModelVO,
  SafetyCreditSourceEventPageQuery,
} from "./types";

const baseURL = `${BASE_API}/safety-credit`;
const ouaaBaseURL = `${BASE_API}/ouaa`;

function unwrap<T>(response: T | LegacyServiceError<T>): T {
  if (response === undefined || response === null) {
    return response as T;
  }
  const data = (response as LegacyServiceError<T>).data;
  return data ?? (response as T);
}

export class CubeSafetyCreditService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  public async pageMerchants(payload: SafetyCreditMerchantPageQuery): Promise<PageResult<SafetyCreditMerchantVO>> {
    const url = `${baseURL}/merchants/page`;
    const resp = await this.gateway.get<PageResult<SafetyCreditMerchantVO> | LegacyServiceError<PageResult<SafetyCreditMerchantVO>>>({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async getMerchant(id: string | number): Promise<SafetyCreditMerchantVO> {
    const url = `${baseURL}/merchants/${id}`;
    const resp = await this.gateway.get<SafetyCreditMerchantVO | LegacyServiceError<SafetyCreditMerchantVO>>({ url });
    return unwrap(resp);
  }

  public async pageOuaaMerchantUsers(payload: SafetyCreditOuaaUserPageQuery): Promise<PageResult<SafetyCreditOuaaUserVO>> {
    const url = `${baseURL}/merchants/ouaa-users/page`;
    const resp = await this.gateway.get<PageResult<SafetyCreditOuaaUserVO> | LegacyServiceError<PageResult<SafetyCreditOuaaUserVO>>>({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async createMerchant(payload: SafetyCreditMerchantCommand): Promise<string | number> {
    const url = `${baseURL}/merchants`;
    const resp = await this.gateway.create<string | number | LegacyServiceError<string | number>>({ url, payload });
    return unwrap(resp);
  }

  public async updateMerchant(id: string | number, payload: SafetyCreditMerchantCommand): Promise<void> {
    const url = `${baseURL}/merchants/${id}`;
    await this.gateway.update({ url, payload });
  }

  public async deleteMerchant(id: string | number): Promise<void> {
    const url = `${baseURL}/merchants/${id}`;
    await this.gateway.delete({ url });
  }

  public async downloadMerchantImportTemplate(): Promise<Blob> {
    const url = `${baseURL}/merchants/import/template`;
    return await this.gateway.customBlob({ url, method: "GET" });
  }

  public async importMerchants(file: Blob): Promise<SafetyCreditMerchantImportResultVO> {
    const url = `${baseURL}/merchants/import`;
    const form = new FormData();
    form.append("file", file);
    const resp = await this.gateway.custom<SafetyCreditMerchantImportResultVO | LegacyServiceError<SafetyCreditMerchantImportResultVO>>({
      url,
      method: "POST",
      payload: form,
    });
    return unwrap(resp);
  }

  public async listOuaaOrganizations(payload: { enabled?: boolean } = { enabled: true }): Promise<SafetyCreditOuaaOrganizationVO[]> {
    const url = `${ouaaBaseURL}/organizations`;
    const resp = await this.gateway.get<SafetyCreditOuaaOrganizationVO[] | LegacyServiceError<SafetyCreditOuaaOrganizationVO[]>>({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async pageOuaaPositions(payload: {
    pageNumber: number;
    pageSize: number;
    enabled?: boolean;
    name?: string;
  }): Promise<PageResult<SafetyCreditOuaaPositionVO>> {
    const url = `${ouaaBaseURL}/positions`;
    const resp = await this.gateway.get<
      PageResult<SafetyCreditOuaaPositionVO> | LegacyServiceError<PageResult<SafetyCreditOuaaPositionVO>>
    >({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async pageOuaaAppointments(payload: {
    pageNumber: number;
    pageSize: number;
    enable?: boolean;
    keyword?: string;
  }): Promise<PageResult<SafetyCreditOuaaAppointmentVO>> {
    const url = `${ouaaBaseURL}/appointment/page`;
    const resp = await this.gateway.get<
      PageResult<SafetyCreditOuaaAppointmentVO> | LegacyServiceError<PageResult<SafetyCreditOuaaAppointmentVO>>
    >({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async pageOuaaRoles(payload: {
    pageNumber: number;
    pageSize: number;
    enabled?: boolean;
    keyword?: string;
  }): Promise<PageResult<SafetyCreditOuaaRoleVO>> {
    const url = `${ouaaBaseURL}/roles`;
    const resp = await this.gateway.get<PageResult<SafetyCreditOuaaRoleVO> | LegacyServiceError<PageResult<SafetyCreditOuaaRoleVO>>>({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async pageDataSources(payload: SafetyCreditDataSourcePageQuery): Promise<PageResult<SafetyCreditDataSourceVO>> {
    const url = `${baseURL}/data-sources/page`;
    const resp = await this.gateway.get<PageResult<SafetyCreditDataSourceVO> | LegacyServiceError<PageResult<SafetyCreditDataSourceVO>>>({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async pageDataSourceEvents(payload: SafetyCreditSourceEventPageQuery): Promise<PageResult<SafetyCreditEventMappingVO>> {
    const url = `${baseURL}/data-sources/events/page`;
    const resp = await this.gateway.get<
      PageResult<SafetyCreditEventMappingVO> | LegacyServiceError<PageResult<SafetyCreditEventMappingVO>>
    >({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async updateDataSourceEnabled(id: string | number, payload: SafetyCreditDataSourceEnabledCommand): Promise<void> {
    const url = `${baseURL}/data-sources/${id}/enabled`;
    await this.gateway.update({ url, payload });
  }

  public async createDataSource(payload: SafetyCreditDataSourceCommand): Promise<string | number> {
    const url = `${baseURL}/data-sources`;
    const resp = await this.gateway.create<string | number | LegacyServiceError<string | number>>({ url, payload });
    return unwrap(resp);
  }

  public async updateDataSourceEventMappings(id: string | number, payload: SafetyCreditEventMappingsCommand): Promise<void> {
    const url = `${baseURL}/data-sources/${id}/event-mappings`;
    await this.gateway.update({ url, payload });
  }

  public async pageScoreModels(payload: SafetyCreditScoreModelPageQuery): Promise<PageResult<SafetyCreditScoreModelVO>> {
    const url = `${baseURL}/score-models/page`;
    const resp = await this.gateway.get<PageResult<SafetyCreditScoreModelVO> | LegacyServiceError<PageResult<SafetyCreditScoreModelVO>>>({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async createScoreModel(payload: SafetyCreditScoreModelCommand): Promise<string | number> {
    const url = `${baseURL}/score-models`;
    const resp = await this.gateway.create<string | number | LegacyServiceError<string | number>>({ url, payload });
    return unwrap(resp);
  }

  public async updateScoreModel(id: string | number, payload: SafetyCreditScoreModelCommand): Promise<void> {
    const url = `${baseURL}/score-models/${id}`;
    await this.gateway.update({ url, payload });
  }

  public async publishScoreModel(id: string | number): Promise<SafetyCreditScoreModelVO | undefined> {
    const url = `${baseURL}/score-models/${id}/publish`;
    const resp = await this.gateway.custom<SafetyCreditScoreModelVO | undefined | LegacyServiceError<SafetyCreditScoreModelVO | undefined>>(
      {
        url,
        method: "POST",
      },
    );
    return unwrap(resp);
  }

  public async listScoreModelVersions(id: string | number): Promise<SafetyCreditScoreModelVersionVO[]> {
    const url = `${baseURL}/score-models/${id}/versions`;
    const resp = await this.gateway.get<SafetyCreditScoreModelVersionVO[] | LegacyServiceError<SafetyCreditScoreModelVersionVO[]>>({
      url,
    });
    return unwrap(resp);
  }

  public async getScoreModelWeightSuggestion(payload: CreditWeightSuggestionInput): Promise<CreditWeightSuggestionOutput> {
    const url = `${baseURL}/score-models/weight-suggestions`;
    const resp = await this.gateway.custom<CreditWeightSuggestionOutput | LegacyServiceError<CreditWeightSuggestionOutput>>({
      url,
      method: "POST",
      payload,
    });
    return unwrap(resp);
  }

  public async pageScoreLogs(payload: SafetyCreditScoreLogPageQuery): Promise<PageResult<SafetyCreditScoreLogVO>> {
    const url = `${baseURL}/score-logs/page`;
    const resp = await this.gateway.get<PageResult<SafetyCreditScoreLogVO> | LegacyServiceError<PageResult<SafetyCreditScoreLogVO>>>({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async getMerchantScoreSummary(merchantId: string | number): Promise<SafetyCreditMerchantScoreSummaryVO> {
    const url = `${baseURL}/score-logs/merchant-summary`;
    const resp = await this.gateway.get<SafetyCreditMerchantScoreSummaryVO | LegacyServiceError<SafetyCreditMerchantScoreSummaryVO>>({
      url,
      payload: { merchantId },
    });
    return unwrap(resp);
  }

  public async pageBehaviors(payload: SafetyCreditBehaviorPageQuery): Promise<PageResult<SafetyCreditBehaviorVO>> {
    const url = `${baseURL}/behaviors/page`;
    const resp = await this.gateway.get<PageResult<SafetyCreditBehaviorVO> | LegacyServiceError<PageResult<SafetyCreditBehaviorVO>>>({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async getBehavior(id: string | number): Promise<SafetyCreditBehaviorVO> {
    const url = `${baseURL}/behaviors/${id}`;
    const resp = await this.gateway.get<SafetyCreditBehaviorVO | LegacyServiceError<SafetyCreditBehaviorVO>>({ url });
    return unwrap(resp);
  }

  public async createManualBehavior(payload: SafetyCreditManualBehaviorCommand): Promise<string | number> {
    const url = `${baseURL}/behaviors/manual`;
    const resp = await this.gateway.create<string | number | LegacyServiceError<string | number>>({ url, payload });
    return unwrap(resp);
  }

  public async pageBehaviorAudits(payload: SafetyCreditBehaviorAuditPageQuery): Promise<PageResult<SafetyCreditBehaviorVO>> {
    const url = `${baseURL}/behaviors/audit/page`;
    const resp = await this.gateway.get<PageResult<SafetyCreditBehaviorVO> | LegacyServiceError<PageResult<SafetyCreditBehaviorVO>>>({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async approveBehavior(id: string | number): Promise<void> {
    const url = `${baseURL}/behaviors/${id}/approve`;
    await this.gateway.custom({ url, method: "POST" });
  }

  public async rejectBehavior(id: string | number, payload: SafetyCreditBehaviorRejectCommand): Promise<void> {
    const url = `${baseURL}/behaviors/${id}/reject`;
    await this.gateway.custom({ url, method: "POST", payload });
  }

  public async pageMerchantBehaviors(payload: SafetyCreditMerchantBehaviorPageQuery): Promise<PageResult<SafetyCreditBehaviorVO>> {
    const url = `${baseURL}/merchant/behaviors/page`;
    const resp = await this.gateway.get<PageResult<SafetyCreditBehaviorVO> | LegacyServiceError<PageResult<SafetyCreditBehaviorVO>>>({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async pageArchives(payload: SafetyCreditArchivePageQuery): Promise<PageResult<SafetyCreditArchiveVO>> {
    const url = `${baseURL}/archives/page`;
    const resp = await this.gateway.get<PageResult<SafetyCreditArchiveVO> | LegacyServiceError<PageResult<SafetyCreditArchiveVO>>>({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async getArchiveSummary(): Promise<SafetyCreditArchiveSummaryVO> {
    const url = `${baseURL}/archives/summary`;
    const resp = await this.gateway.get<SafetyCreditArchiveSummaryVO | LegacyServiceError<SafetyCreditArchiveSummaryVO>>({ url });
    return unwrap(resp);
  }

  public async getArchive(merchantId: string | number): Promise<SafetyCreditArchiveDetailVO> {
    const url = `${baseURL}/archives/${merchantId}`;
    const resp = await this.gateway.get<SafetyCreditArchiveDetailVO | LegacyServiceError<SafetyCreditArchiveDetailVO>>({ url });
    return unwrap(resp);
  }

  public async suspendArchive(merchantId: string | number, payload: SafetyCreditArchiveOperationCommand): Promise<void> {
    const url = `${baseURL}/archives/${merchantId}/suspend`;
    await this.gateway.custom({ url, method: "POST", payload });
  }

  public async recoverArchive(merchantId: string | number, payload: SafetyCreditArchiveOperationCommand): Promise<void> {
    const url = `${baseURL}/archives/${merchantId}/recover`;
    await this.gateway.custom({ url, method: "POST", payload });
  }

  public async downloadArchives(payload: SafetyCreditArchivePageQuery): Promise<Blob> {
    const url = `${baseURL}/archives/export`;
    return await this.gateway.customBlob({ url, method: "GET", payload });
  }

  public async pageRankings(payload: SafetyCreditRankingPageQuery): Promise<PageResult<SafetyCreditRankingVO>> {
    const url = `${baseURL}/rankings/page`;
    const resp = await this.gateway.get<PageResult<SafetyCreditRankingVO> | LegacyServiceError<PageResult<SafetyCreditRankingVO>>>({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async getRankingSummary(payload: SafetyCreditRankingSummaryQuery): Promise<SafetyCreditRankingSummaryVO> {
    const url = `${baseURL}/rankings/summary`;
    const resp = await this.gateway.get<SafetyCreditRankingSummaryVO | LegacyServiceError<SafetyCreditRankingSummaryVO>>({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async getPublicityConfig(parkName: string): Promise<SafetyCreditPublicityConfigVO> {
    const url = `${baseURL}/publicity-config`;
    const resp = await this.gateway.get<SafetyCreditPublicityConfigVO | LegacyServiceError<SafetyCreditPublicityConfigVO>>({
      url,
      payload: { parkName },
    });
    return unwrap(resp);
  }

  public async updatePublicityConfig(payload: SafetyCreditPublicityConfigCommand): Promise<SafetyCreditPublicityConfigVO> {
    const url = `${baseURL}/publicity-config`;
    const resp = await this.gateway.custom<SafetyCreditPublicityConfigVO | LegacyServiceError<SafetyCreditPublicityConfigVO>>({
      url,
      method: "PUT",
      payload,
    });
    return unwrap(resp);
  }

  public async getMerchantCredit(merchantId: string | number): Promise<SafetyCreditArchiveDetailVO> {
    const url = `${baseURL}/merchant/credit`;
    const resp = await this.gateway.get<SafetyCreditArchiveDetailVO | LegacyServiceError<SafetyCreditArchiveDetailVO>>({
      url,
      payload: { merchantId },
    });
    return unwrap(resp);
  }

  public async pageChecklists(payload: SafetyCreditChecklistPageQuery): Promise<PageResult<SafetyCreditChecklistVO>> {
    const url = `${baseURL}/checklists/page`;
    const resp = await this.gateway.get<PageResult<SafetyCreditChecklistVO> | LegacyServiceError<PageResult<SafetyCreditChecklistVO>>>({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async generateChecklist(payload: SafetyCreditChecklistGenerateCommand): Promise<Array<string | number>> {
    const url = `${baseURL}/checklists/generate`;
    const resp = await this.gateway.create<Array<string | number> | LegacyServiceError<Array<string | number>>>({ url, payload });
    return unwrap(resp);
  }

  public async getChecklist(id: string | number): Promise<SafetyCreditChecklistVO> {
    const url = `${baseURL}/checklists/${id}`;
    const resp = await this.gateway.get<SafetyCreditChecklistVO | LegacyServiceError<SafetyCreditChecklistVO>>({ url });
    return unwrap(resp);
  }

  public async updateChecklist(id: string | number, payload: SafetyCreditChecklistSaveCommand): Promise<void> {
    const url = `${baseURL}/checklists/${id}`;
    await this.gateway.update({ url, payload });
  }

  public async deleteChecklist(id: string | number): Promise<void> {
    const url = `${baseURL}/checklists/${id}`;
    await this.gateway.delete({ url });
  }

  public async publishChecklist(id: string | number): Promise<void> {
    const url = `${baseURL}/checklists/${id}/publish`;
    await this.gateway.custom({ url, method: "POST" });
  }

  public async getCurrentCheckExecution(merchantId: string | number): Promise<SafetyCreditCheckExecutionVO | null> {
    const url = `${baseURL}/check-executions/current`;
    const resp = await this.gateway.get<SafetyCreditCheckExecutionVO | null | LegacyServiceError<SafetyCreditCheckExecutionVO | null>>({
      url,
      payload: { merchantId },
    });
    return unwrap(resp);
  }

  public async listCurrentCheckExecutions(merchantId: string | number): Promise<SafetyCreditCheckExecutionVO[]> {
    const url = `${baseURL}/check-executions/current/list`;
    const resp = await this.gateway.get<SafetyCreditCheckExecutionVO[] | LegacyServiceError<SafetyCreditCheckExecutionVO[]>>({
      url,
      payload: { merchantId },
    });
    return unwrap(resp);
  }

  public async ensureCurrentCheckExecution(payload: SafetyCreditCheckExecutionEnsureCommand): Promise<SafetyCreditCheckExecutionVO> {
    const url = `${baseURL}/check-executions/current/ensure`;
    const resp = await this.gateway.create<SafetyCreditCheckExecutionVO | LegacyServiceError<SafetyCreditCheckExecutionVO>>({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async getCheckExecution(id: string | number): Promise<SafetyCreditCheckExecutionVO> {
    const url = `${baseURL}/check-executions/${id}`;
    const resp = await this.gateway.get<SafetyCreditCheckExecutionVO | LegacyServiceError<SafetyCreditCheckExecutionVO>>({ url });
    return unwrap(resp);
  }

  public async saveCheckExecutionDraft(id: string | number, payload: SafetyCreditCheckExecutionSubmitCommand): Promise<void> {
    const url = `${baseURL}/check-executions/${id}/draft`;
    await this.gateway.update({ url, payload });
  }

  public async submitCheckExecution(id: string | number, payload: SafetyCreditCheckExecutionSubmitCommand): Promise<void> {
    const url = `${baseURL}/check-executions/${id}/submit`;
    await this.gateway.custom({ url, method: "POST", payload });
  }

  public async pageCheckQuality(payload: SafetyCreditCheckQualityPageQuery): Promise<PageResult<SafetyCreditCheckQualityVO>> {
    const url = `${baseURL}/check-quality/page`;
    const resp = await this.gateway.get<
      PageResult<SafetyCreditCheckQualityVO> | LegacyServiceError<PageResult<SafetyCreditCheckQualityVO>>
    >({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async getCheckQualitySummary(payload: SafetyCreditCheckQualityPageQuery): Promise<SafetyCreditCheckQualitySummaryVO> {
    const url = `${baseURL}/check-quality/summary`;
    const resp = await this.gateway.get<SafetyCreditCheckQualitySummaryVO | LegacyServiceError<SafetyCreditCheckQualitySummaryVO>>({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async reviewCheckQuality(id: string | number, payload: SafetyCreditCheckQualityReviewCommand): Promise<void> {
    const url = `${baseURL}/check-quality/${id}/review`;
    await this.gateway.custom({ url, method: "POST", payload });
  }

  public async getCheckStatisticsSummary(): Promise<SafetyCreditCheckStatisticsSummaryVO> {
    const url = `${baseURL}/check-statistics/summary`;
    const resp = await this.gateway.get<SafetyCreditCheckStatisticsSummaryVO | LegacyServiceError<SafetyCreditCheckStatisticsSummaryVO>>({
      url,
    });
    return unwrap(resp);
  }

  public async pageCheckMerchantPerformance(payload: SafetyCreditCheckQualityPageQuery): Promise<PageResult<SafetyCreditCheckExecutionVO>> {
    const url = `${baseURL}/check-statistics/merchant-performance/page`;
    const resp = await this.gateway.get<
      PageResult<SafetyCreditCheckExecutionVO> | LegacyServiceError<PageResult<SafetyCreditCheckExecutionVO>>
    >({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async pageBenefitRules(payload: SafetyCreditBenefitRulePageQuery): Promise<PageResult<SafetyCreditBenefitRuleVO>> {
    const url = `${baseURL}/benefit-rules/page`;
    const resp = await this.gateway.get<PageResult<SafetyCreditBenefitRuleVO> | LegacyServiceError<PageResult<SafetyCreditBenefitRuleVO>>>({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async createBenefitRule(payload: SafetyCreditBenefitRuleCommand): Promise<string | number> {
    const url = `${baseURL}/benefit-rules`;
    const resp = await this.gateway.create<string | number | LegacyServiceError<string | number>>({ url, payload });
    return unwrap(resp);
  }

  public async updateBenefitRule(id: string | number, payload: SafetyCreditBenefitRuleCommand): Promise<void> {
    const url = `${baseURL}/benefit-rules/${id}`;
    await this.gateway.update({ url, payload });
  }

  public async deleteBenefitRule(id: string | number): Promise<void> {
    const url = `${baseURL}/benefit-rules/${id}`;
    await this.gateway.delete({ url });
  }

  public async updateBenefitRuleEnabled(id: string | number, payload: SafetyCreditDataSourceEnabledCommand): Promise<void> {
    const url = `${baseURL}/benefit-rules/${id}/enabled`;
    await this.gateway.update({ url, payload });
  }

  public async pageBenefitRecords(payload: SafetyCreditBenefitRecordPageQuery): Promise<PageResult<SafetyCreditBenefitRecordVO>> {
    const url = `${baseURL}/benefit-records/page`;
    const resp = await this.gateway.get<
      PageResult<SafetyCreditBenefitRecordVO> | LegacyServiceError<PageResult<SafetyCreditBenefitRecordVO>>
    >({
      url,
      payload,
    });
    return unwrap(resp);
  }

  public async createBenefitRecord(payload: SafetyCreditBenefitRecordCreateCommand): Promise<string | number> {
    const url = `${baseURL}/benefit-records`;
    const resp = await this.gateway.create<string | number | LegacyServiceError<string | number>>({ url, payload });
    return unwrap(resp);
  }

  public async confirmBenefitRecord(id: string | number, payload?: SafetyCreditBenefitRecordOperateCommand): Promise<void> {
    const url = `${baseURL}/benefit-records/${id}/confirm`;
    await this.gateway.custom({ url, method: "POST", payload });
  }

  public async cancelBenefitRecord(id: string | number, payload?: SafetyCreditBenefitRecordOperateCommand): Promise<void> {
    const url = `${baseURL}/benefit-records/${id}/cancel`;
    await this.gateway.custom({ url, method: "POST", payload });
  }
}
