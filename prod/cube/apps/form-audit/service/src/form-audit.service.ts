import { BASE_API } from "@ghcloud/cube-protocol";

import type {
  PageResult,
  FormFlowDetailVO,
  InspectPlanDraftOptionVO,
  MaintenancePlanDraftOptionVO,
  FormAppraisalRuleDetailVO,
  FormAppraisalRuleSaveCommand,
  FormAppraisalRulePageVO,
  FormAppraisalRecordGroupVO,
  FormAppraisalRecordDetailVO,
  FormAppraisalStatisticsVO,
  PersonnelWorkOrderStatisticsVO,
  FlowProcessVO,
  WorkOrderBusinessTypeModel,
  Department,
  GroupTree,
  OrganizationListQuery,
  FormFlowGroupVO,
} from "./types";

const baseURL = `${BASE_API}/flow`;
const maintainBaseURL = `${BASE_API}/maintain`;
const ouaaBaseURL = `${BASE_API}/ouaa`;
const appraisalsBaseURL = `${BASE_API}/form-appraisals`;

export class CubeFormAuditService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  public async getBusinessFormFlowPageList(payload: {
    pageNumber: number;
    pageSize: number;
    keyword?: string | undefined;
    type?: string | undefined;
    fromGroupId?: string | number | undefined;
    enable?: boolean | undefined;
    application?: string | undefined;
  }): Promise<PageResult<FormFlowDetailVO>> {
    const url = `${baseURL}/form-flow/type/page`;
    const resp = await this.gateway.get<PageResult<FormFlowDetailVO>>({ url, payload });
    return resp;
  }

  // 个人发起工单统计
  public async getWorkOrderStatisticsByUser(payload: {
    pageNumber: number;
    pageSize: number;
    applicationCode: string;
    period?: string | undefined;
    organizationId?: string | undefined;
    keyword?: string | undefined;
  }): Promise<PageResult<PersonnelWorkOrderStatisticsVO>> {
    const url = `${baseURL}/getWordOrderStatisticsByUser`;
    const resp = await this.gateway.get<PageResult<PersonnelWorkOrderStatisticsVO>>({ url, payload });
    return resp;
  }

  // 导出个人发起工单统计
  public async exportWorkOrderStatisticsByUser(payload: {
    applicationCode: string;
    period?: string | undefined;
    organizationId?: string | undefined;
    keyword?: string | undefined;
  }): Promise<Blob> {
    const url = `${baseURL}/exportWordOrderStatisticsByUser`;
    const resp = await this.gateway.customBlob({
      url,
      method: "GET",
      payload,
    });
    return resp;
  }

  public async getFormFlowById(id: string): Promise<FormFlowDetailVO> {
    const url = `${baseURL}/form-flow/${encodeURIComponent(id)}`;
    const resp = await this.gateway.get<FormFlowDetailVO>({ url });
    return resp;
  }

  public async getInspectPlanPageV2(payload: {
    pageNumber: number;
    pageSize: number;
    keyword?: string | undefined;
  }): Promise<PageResult<InspectPlanDraftOptionVO>> {
    const url = `${maintainBaseURL}/inspect-plan/pageV2`;
    const kw = payload.keyword?.trim();
    const resp = await this.gateway.get<PageResult<InspectPlanDraftOptionVO>>({
      url,
      payload: {
        pageNumber: payload.pageNumber,
        pageSize: payload.pageSize,
        ...(kw !== undefined && kw !== "" ? { keywords: kw } : {}),
      },
    });
    return resp;
  }

  public async getMaintenancePlanSelectPage(payload: {
    pageNumber: number;
    pageSize: number;
    maintenancePlanName?: string | undefined;
  }): Promise<PageResult<MaintenancePlanDraftOptionVO>> {
    const url = `${maintainBaseURL}/select-maintenance-plan`;
    const name = payload.maintenancePlanName?.trim();
    const resp = await this.gateway.get<PageResult<MaintenancePlanDraftOptionVO>>({
      url,
      payload: {
        pageNumber: payload.pageNumber,
        pageSize: payload.pageSize,
        ...(name !== undefined && name !== "" ? { maintenancePlanName: name } : {}),
      },
    });
    return resp;
  }

  /** 获取审批列表 */
  public async getFlowProcessPage(payload: {
    applicationCode?: string | undefined;
    fromGroupId?: string;
    businessType?: string;
    organizationId?: string;
    pageNumber: number;
    pageSize: number;
    processInstanceIds?: string;
    processInstanceIdsList?: string[];
    startUserId?: string;
    status?: string;
    submitTime?: string;
    type?: string;
    username?: string;
  }): Promise<PageResult<FlowProcessVO>> {
    const url = `${baseURL}/process/instance/historical/page`;
    const resp = await this.gateway.get<PageResult<FlowProcessVO>>({ url, payload });
    return resp;
  }

  public async getAppraisalProcessAllPage(payload: {
    applicationCode: string;
    businessType?: string;
    organizationId?: string;
    status?: string;
    submitTime?: string;
    username?: string;
    type?: string;
    pageNumber: number;
    pageSize: number;
  }): Promise<PageResult<FlowProcessVO>> {
    const url = `${appraisalsBaseURL}/appraisal/process/allPage`;
    return await this.gateway.get<PageResult<FlowProcessVO>>({ url, payload });
  }

  public async exportWorkOrderList(payload: {
    applicationCode?: string;
    businessType?: string;
    organizationId?: string;
    username?: string;
    submitTime?: string;
    status?: string;
  }): Promise<Blob> {
    const url = `${appraisalsBaseURL}/appraisal/process/allPage/export`;
    return await this.gateway.customBlob({
      url,
      method: "GET",
      payload,
    });
  }

  // 兼容审批中心导出接口
  public async exportLegacyWorkOrderList(payload: {
    applicationCode?: string;
    businessType?: string;
    organizationId?: string;
    username?: string;
    submitTime?: string;
    status?: string;
  }): Promise<Blob> {
    const url = `${baseURL}/process/instance/historical/export`;
    return await this.gateway.customBlob({
      url,
      method: "GET",
      payload,
    });
  }

  public async deleteWorkOrder(payload: string[]): Promise<boolean> {
    const url = `${baseURL}/form/instance/form-flows/delete`;
    return await this.gateway.create<boolean>({
      url,
      payload: payload as never,
    });
  }

  public async getWorkOrderBusinessTypeList(payload?: { application?: string }): Promise<WorkOrderBusinessTypeModel[]> {
    const url = `${baseURL}/form-business/type/list`;
    return await this.gateway.get<WorkOrderBusinessTypeModel[]>({ url, payload });
  }

  public async getAssessmentRulePage(payload: {
    pageNumber: number;
    pageSize: number;
    keyword?: string | undefined;
    periodType?: string | undefined;
    responsibleDepartmentId?: string | undefined;
    enabled?: boolean | undefined;
  }): Promise<PageResult<FormAppraisalRulePageVO>> {
    const url = `${appraisalsBaseURL}/form-appraisal-rule/page`;
    const resp = await this.gateway.get<PageResult<FormAppraisalRulePageVO>>({ url, payload });
    return resp;
  }

  /** 考核统计看板（GET `/form-appraisal-record/statistics`） */
  public async getAppraisalRecordStatistics(payload: {
    periodType: string;
    assessmentYear: number;
    keyword?: string | undefined;
    inspectionItem?: string | undefined;
    responsibleDepartmentId?: string | undefined;
    status?: string | undefined;
  }): Promise<FormAppraisalStatisticsVO> {
    const url = `${appraisalsBaseURL}/form-appraisal-record/statistics`;
    const { responsibleDepartmentId, ...rest } = payload;
    const queryPayload: Record<string, unknown> = {
      ...rest,
    };
    if (responsibleDepartmentId !== undefined && responsibleDepartmentId !== "") {
      queryPayload.responsibleDepartmentId = responsibleDepartmentId;
    }
    return await this.gateway.get<FormAppraisalStatisticsVO>({ url, payload: queryPayload });
  }

  /** 生成考核预览数据（POST `/form-appraisal-record/preview/generate`） */
  public async generateAppraisalRecordPreview(): Promise<boolean> {
    const url = `${appraisalsBaseURL}/form-appraisal-record/preview/generate`;
    return await this.gateway.create<boolean>({ url });
  }

  public async getAppraisalRecordPage(payload: {
    pageNumber: number;
    pageSize: number;
    keyword?: string | undefined;
    inspectionItem?: string | undefined;
    periodType?: string | undefined;
    responsibleDepartmentId?: string | undefined;
    firstLevelFormGroupId?: string | undefined;
    secondLevelFormGroupId?: string | undefined;
    assessmentYear?: number | undefined;
    assessmentPeriod?: number | undefined;
    generatedBeginTime?: string | undefined;
    generatedEndTime?: string | undefined;
    status?: string | undefined;
  }): Promise<PageResult<FormAppraisalRecordGroupVO>> {
    const url = `${appraisalsBaseURL}/form-appraisal-record/page`;
    const resp = await this.gateway.get<PageResult<FormAppraisalRecordGroupVO>>({ url, payload });
    return resp;
  }

  public async exportAppraisalRecord(payload: {
    keyword?: string | undefined;
    inspectionItem?: string | undefined;
    periodType?: string | undefined;
    responsibleDepartmentId?: string | undefined;
    assessmentYear?: number | undefined;
    assessmentPeriod?: number | undefined;
    generatedBeginTime?: string | undefined;
    generatedEndTime?: string | undefined;
    status?: string | undefined;
  }): Promise<Blob> {
    const url = `${appraisalsBaseURL}/form-appraisal-record/export`;
    const resp = await this.gateway.customBlob({
      url,
      method: "GET",
      payload,
    });
    return resp;
  }

  public async getAppraisalRecordDetail(id: string): Promise<FormAppraisalRecordDetailVO | null> {
    const url = `${appraisalsBaseURL}/form-appraisal-record/${encodeURIComponent(id)}`;
    return await this.gateway.get<FormAppraisalRecordDetailVO | null>({ url });
  }

  public async getAssessmentRuleDetail(id: string): Promise<FormAppraisalRuleDetailVO> {
    const url = `${appraisalsBaseURL}/form-appraisal-rule/${encodeURIComponent(id)}`;
    return await this.gateway.get<FormAppraisalRuleDetailVO>({ url });
  }

  public async createAssessmentRule(payload: FormAppraisalRuleSaveCommand): Promise<FormAppraisalRuleDetailVO> {
    const url = `${appraisalsBaseURL}/form-appraisal-rule`;
    const body = { ...payload } as Record<string, unknown>;
    delete body.id;
    const resp = await this.gateway.create<FormAppraisalRuleDetailVO>({
      url,
      payload: body,
    });
    return resp;
  }

  public async updateAssessmentRule(id: string, payload: FormAppraisalRuleSaveCommand): Promise<FormAppraisalRuleDetailVO> {
    const url = `${appraisalsBaseURL}/form-appraisal-rule/${encodeURIComponent(id)}`;
    const resp = await this.gateway.update<FormAppraisalRuleDetailVO>({
      url,
      payload: payload as unknown as Record<string, unknown>,
    });
    return resp;
  }

  public async updateAssessmentRuleEnable(payload: { id: string; enable: boolean }): Promise<boolean> {
    const url = `${appraisalsBaseURL}/form-appraisal-rule/${encodeURIComponent(payload.id)}/enabled?enable=${payload.enable}`;
    const resp = await this.gateway.create<boolean>({ url });
    return resp;
  }

  public async deleteAssessmentRule(id: string): Promise<void> {
    const url = `${appraisalsBaseURL}/form-appraisal-rule/${encodeURIComponent(id)}`;
    await this.gateway.delete({ url });
  }

  public async getOrganizations(params: OrganizationListQuery): Promise<Department[]> {
    const url = `${ouaaBaseURL}/authenticated/organizations/list`;
    const resp = await this.gateway.get<LegacyServiceError<Department[]>>({
      payload: {
        ...params,
      },
      url,
    });
    return resp.data || resp;
  }

  // 表单流程分组-树
  public async getFlowGroupTree(params: { keyword: string }): Promise<GroupTree[]> {
    const url = `${baseURL}/form-flow-group/tree`;
    const resp = await this.gateway.get<LegacyServiceError<GroupTree[]>>({
      payload: {
        ...params,
      },
      url,
    });
    return resp.data || resp;
  }

  // 获取表单配置列表（分页）
  public async getFormFlowPageList(payload: {
    pageNumber: number;
    pageSize: number;
    keyword?: string | undefined;
    type?: string | undefined;
    fromGroupId?: string | number | undefined;
    enable?: boolean | undefined;
    application?: string | undefined;
  }): Promise<PageResult<FormFlowDetailVO>> {
    const url = `${baseURL}/custom-form-flow/page`;
    const resp = await this.gateway.get<PageResult<FormFlowDetailVO>>({ url, payload });
    return resp;
  }

  /** 启用表单-修改 */
  public async updateFormFlowEnable(payload: { id: string; enable: boolean }): Promise<boolean> {
    const url = `${baseURL}/custom-form-flow/enable?id=${payload.id}&enable=${payload.enable}`;
    const resp = await this.gateway.update<boolean>({ url });
    return resp;
  }

  /** 删除表单 */
  public async deleteFormFlow(id: string): Promise<void> {
    const url = `${baseURL}/custom-form-flow/${id}`;
    const resp = await this.gateway.delete({ url });
    return resp;
  }

  /** 公开表单分享链接生成二维码 */
  public async getQrCode(payload: { tenant: string; id: string; qrCodeUrl: string; businessType: string }): Promise<{ path: string }> {
    const url = `${baseURL}/form-flow/qr-code`;
    const resp = await this.gateway.get<{ path: string }>({ url, payload });
    return resp;
  }

  // 获取分组下的工单个数(全量)
  public async getFormFlowGroupCount(payload?: {
    application: string;
    keyword?: string;
    formFlowIds?: string[];
    filterEmpty?: boolean;
  }): Promise<FormFlowGroupVO[]> {
    const url = `${baseURL}/custom-form-flow/group/tree/permission/count`;
    const resp = await this.gateway.get<FormFlowGroupVO[]>(payload ? { url, payload } : { url });
    return resp;
  }

  // 表单流程分组列表（用于下拉）
  public async getFormFlowGroupList(payload?: {
    application?: string;
  }): Promise<{ id: string; name: string; parentId?: string; children?: Array<{ id: string; name: string; parentId?: string }> }[]> {
    const url = `${baseURL}/form-flow-group/list`;
    return await this.gateway.get<
      { id: string; name: string; parentId?: string; children?: Array<{ id: string; name: string; parentId?: string }> }[]
    >({ url, payload });
  }

  // 表单流程分组（新增/修改）
  public async updateFormFlowGroup(payload: {
    id: string | undefined;
    parentId?: string | undefined;
    name: string;
    application?: string;
  }): Promise<boolean> {
    const url = `${baseURL}/form-flow-group/save-or-update`;
    const resp = await this.gateway.create<boolean>({ url, payload });
    return resp;
  }

  // 表单流程分组（删除）
  public async deleteFormFlowGroup(id: string): Promise<void> {
    const url = `${baseURL}/form-flow-group/${id}`;
    return await this.gateway.delete({ url });
  }
}
