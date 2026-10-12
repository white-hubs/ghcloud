import type {
  AnalysisOfAudit,
  DepTaskExecution,
  FileVO,
  FrequencyAnalysis,
  HiddenDangerOrderStatVo,
  HiddenDangerType,
  HiddenStatisticsType,
  InspectRecord,
  InspectStatistics,
  InspectionNum,
  ObjAbnormal,
  ObjAnalysis,
  ObjTask,
  PatrolLocationVO,
  PatrolPointDTO,
  PlanAnalysis,
  RecordDetailResult,
  ReportOverviewType,
  TargetCategory,
  TaskAnalysis,
  TaskExecution,
  TaskTime,
} from "./type";
import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

const baseURL = `${BASE_API}/maintain`;

export interface InspectPointList {
  pages: number;
  records: RootObject[];
  total: number;
}
export interface ReportType {
  id: number;
  type: "";
  typeName: "";
  name: "";
  createTime: "";
}

export interface InspectPointType {
  id: string;
  name: string;
}

export interface FaultListType {
  formInstanceId: string;
  processInstanceId: string;
  businessType: string;
  status: string;
  startUserInfo: {
    organizationName: string;
    startUserName: string;
  };
  submitedTime: number;
  currentTaskId: string;
  instanceName: string;
  objName: string;
  hiddenObjName: string;
  result: string;
  name: string;
  id: string;
  activeNodeAssignee: string;
}
export interface BacklogType {
  formNo: string;
  processInstanceId: string;
  startUserId: string;
  startUserInfo: {
    startUserId: string;
    startUserName: string;
    organizationId: string;
    organizationName: string;
  };
  formInstanceId: string;
  startUserName: string;
  submitedTime: number;
  lastTaskCompletedTime: number;
  status: string;
  activeNodeName: string;
  activeNodeAssignee: string;
  currentTaskId: string;
  variables: unknown;
  instanceName: string;
  businessType: string;
  createTime: number;
  updateTime: number;
  code: string;
  name: string;
  hiddenObjName: string;
  objName: string;
  hiddenType: string;
  source: string;
  urgencyLevel: string;
  result: string;
}
export interface TaskDetailType {
  [key: string]: string | string[];
  targetId: string;
  id: string;
  targetName: string;
  taskName: string;
  executeData: string;
  organizationName: string;
  areaName: string;
  time: string;
  result: string;
  completeDate: string;
  userName: string;
  patrolLocationNum: string;
  completedNum: string;
  undoneNum: string;
  untowardLocationNum: string;
  normalLocationNum: string;
  executePeriod: string[];
}
export interface FaultCaseType {
  id: string;
  name: string;
  faultTypeId: string | undefined;
  fileIds: string[];
  faultTypeName: string;
  deviceTypeId: string;
  deviceTypeName: string;
  faultCount?: number;
  faultPhenomenon: string;
  faultReason: string;
  treatmentMeasures: string;
  files: [];
  productCategoryCode: string[] | string;
  productCategoryName: string;
}
export interface ElectronTaskType {
  id: string;
  patrolResult: string;
  locationName: string;
  arae: [];
  patrolDate: string;
}
export interface ElectronicPatrols {
  formInstanceId: string;
  undoneNum: string;
  completedNum: string;
  completeDate: string;
  patrolLocationNum: string;
  userName: string;
  taskName: string;
  id: string;
}

/**
 * RiskSourceLedgerVO，查询结果
 */
export interface RootObject {
  id: string;
  codeNum: string;
  name: string;
  typeName: string;
  typeId: string;
  depName: string;
  depId: string;
  areaId: string;
  areaName: string;
  detailAddress: string;
  location: string;
}

export class CubeMaintainService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  // 分页查询现场点列表
  public async inspectPointList(payload: { pageNumber: number; pageSize: number; areaId?: string }): Promise<InspectPointList> {
    const url = `${baseURL}/inspect/pointList`;
    const resp = await this.gateway.get<LegacyServiceError<InspectPointList>>({ url, payload });
    return resp.data || resp;
  }

  // 现场点类型列表
  public async inspectPointTypeList(): Promise<InspectPointType[]> {
    const url = `${baseURL}/inspect/sceneTypeList`;
    const resp = await this.gateway.get<LegacyServiceError<InspectPointType[]>>({ url });
    return resp.data || resp;
  }

  /**
   * @说明 故障单列表
   * @returns
   */
  public async faultApplyPersonal(payload: {
    pageNumber: number;
    pageSize: number;
    businessType: string;
    submitTime: string;
  }): Promise<{ page: string; records: FaultListType[]; total: number }> {
    const url = `${baseURL}/fault/apply/personal`;
    const resp = await this.gateway.get<LegacyServiceError<{ page: string; records: FaultListType[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  // 故障案例分页信息
  public async faultCasePage(payload: {
    pageNumber: number;
    pageSize: number;
    keyword: string;
  }): Promise<{ page: string; records: FaultCaseType[]; total: number }> {
    const url = `${baseURL}/fault-case/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ page: string; records: FaultCaseType[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  // 故障案例新增
  public async addFaultCase(payload: {
    name: string;
    faultTypeId: string;
    faultTypeName: string;
    productCategoryCode: string;
    deviceTypeName: string;
    faultPhenomenon: string;
    faultReason: string;
    treatmentMeasures: string;
    fileIds: string[];
  }): Promise<unknown> {
    const url = `${baseURL}/fault-case`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  // 故障案例详情
  public async faultCaseDetail(id: string): Promise<FaultCaseType> {
    const url = `${baseURL}/fault-case/${id}`;
    const resp = await this.gateway.get<LegacyServiceError<FaultCaseType>>({ url });
    return resp.data || resp;
  }

  // 故障案例删除
  public async faultCaseDelete(id: string): Promise<void> {
    const url = `${baseURL}/fault-case/${id}`;
    await this.gateway.delete({ url });
  }

  // 故障案例编辑
  public async faultCaseUpdate(payload: {
    id: string;
    name: string;
    faultTypeId: undefined | string;
    faultTypeName: string;
    productCategoryCode: string[] | string;
    faultPhenomenon: string;
    faultReason: string;
    treatmentMeasures: string;
    files: FileVO[];
    fileIds: string[];
  }): Promise<void> {
    const url = `${baseURL}/fault-case/${payload.id}`;
    await this.gateway.update({ url, payload });
  }

  // 故障案例新增
  public async faultCaseAdd(payload: {
    name: string;
    faultTypeId: undefined | string;
    faultTypeName: string;
    productCategoryCode: string | string[];
    faultPhenomenon: string;
    faultReason: string;
    treatmentMeasures: string;
    files: FileVO[];
    fileIds: string[];
  }): Promise<void> {
    const url = `${baseURL}/fault-case`;
    await this.gateway.create({ url, payload });
  }

  // 故障类型列表
  public async faultTypeList(payload?: {
    pageNumber?: number;
    pageSize?: number;
    keyword?: string;
    applicationCode?: string;
  }): Promise<FaultListType[]> {
    const url = `${baseURL}/fault-type/list`;
    const resp = await this.gateway.get<LegacyServiceError<FaultListType[]>>({ url, payload });
    return resp.data || resp;
  }

  // 故障类型工单统计
  public async getFaultApplyStatistics(payload?: {
    pageNumber?: number;
    pageSize?: number;
    faultTypeId?: string | undefined;
    period?: string;
    applicationCode?: string;
  }): Promise<{ page: string; records: FaultListType[]; total: number }> {
    const url = `${baseURL}/fault/apply/statistics/type`;
    const resp = await this.gateway.get<LegacyServiceError<{ page: string; records: FaultListType[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  // 故障类型工单统计导出
  public async getFaultStatisticsTypeExcel(payload?: {
    pageNumber?: number;
    pageSize?: number;
    faultTypeId?: string | undefined;
    period?: string;
    applicationCode?: string;
  }): Promise<FaultListType[]> {
    const url = `${baseURL}/fault/apply/statistics/typeExcel`;
    const resp = await this.gateway.get<LegacyServiceError<FaultListType[]>>({ url, payload });
    return resp.data || resp;
  }

  public async faultTypeAdd(payload?: { applicationCode: string; name: string }): Promise<FaultListType[]> {
    const url = `${baseURL}/fault-type`;
    const resp = await this.gateway.create<LegacyServiceError<FaultListType[]>>({ url, payload });
    return resp.data || resp;
  }

  public async faultTypeUpdate(payload: { applicationCode: string; id: string; name: string }): Promise<FaultListType[]> {
    const url = `${baseURL}/fault-type/${payload.id}`;
    const resp = await this.gateway.update<LegacyServiceError<FaultListType[]>>({ url, payload });
    return resp.data || resp;
  }

  public async faultTypeDelete(id: string): Promise<void> {
    const url = `${baseURL}/fault-type/${id}`;
    await this.gateway.delete({ url });
  }

  // 获取故障报修工单
  public async getFlowProcessPage(payload: {
    pageNumber: number;
    pageSize: number;
    businessType: string;
    type?: string;
    status?: string | undefined;
    processInstanceIds?: string;
    submitTime?: string | undefined;
  }): Promise<{ page: string; records: FaultListType[]; total: number }> {
    const url = `${baseURL}/fault/apply/all`;
    const resp = await this.gateway.get<LegacyServiceError<{ page: string; records: FaultListType[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  // 报告分页
  public async getReport(payload: {
    pageNumber: number;
    pageSize: number;
    type?: string | null;
    keyword?: string | null;
    applicationCode?: string;
  }): Promise<{ page: string; records: ReportType[]; total: number }> {
    const url = `${baseURL}/getReport`;
    const resp = await this.gateway.get<LegacyServiceError<{ page: string; records: ReportType[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  // 报告新增
  public async addReport(payload: { type: string | undefined; reportTime: string; remark?: string }): Promise<unknown> {
    const url = `${baseURL}/addReport`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  // 报告删除
  public async deleteReport(id: string): Promise<void> {
    const url = `${baseURL}/deleteReport/${id}`;
    await this.gateway.delete({ url });
  }

  // 个人故障报修工单
  public async getFaultApplyPersonal(payload: {
    pageNumber: number;
    pageSize: number;
    type?: string;
    status?: string;
    businessType?: string;
  }): Promise<{ page: string; records: FaultListType[]; total: number }> {
    const url = `${baseURL}/fault/apply/personal`;
    const resp = await this.gateway.get<LegacyServiceError<{ page: string; records: FaultListType[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  // 获取隐患排查工单
  public async getHiddenPage(payload: {
    pageNumber: number;
    pageSize: number;
    businessType: string;
    type?: string;
    status?: string;
    submitTime?: string;
    processInstanceIds?: string;
    hiddenObjId?: string;
  }): Promise<{ pages: number; records: FaultListType[]; total: number }> {
    const url = `${baseURL}/hidden/apply/all`;
    const resp = await this.gateway.get<LegacyServiceError<{ pages: number; records: FaultListType[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /**
   * 获取隐患工单统计
   * @param id
   * @returns
   */
  public async getHiddenStatPage(payload: {
    period?: string;
    pageNumber: number;
    pageSize: number;
    hiddenDangerTypeId?: string;
    applicationCode?: string;
  }): Promise<{ total: number; records: HiddenDangerOrderStatVo[]; pages: number }> {
    const url = `${baseURL}/hidden/work/order/statistics`;
    const resp = await this.gateway.get<LegacyServiceError<{ total: number; records: HiddenDangerOrderStatVo[]; pages: number }>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  // 故障报告信息详情
  public async getReportOverview(id: string): Promise<ReportOverviewType> {
    const url = `${baseURL}/getReportOverview/${id}`;
    const resp = await this.gateway.get<LegacyServiceError<ReportOverviewType>>({ url });
    return resp.data || resp;
  }

  // 数据看板流程实例(隐患排查)
  public async getBacklog(payload: {
    pageNumber: number;
    pageSize: number;
    applicationCode: string;
    type?: string;
    status?: string;
    businessType?: string;
    period?: string;
  }): Promise<{ page: string; records: BacklogType[]; total: number }> {
    const url = `${baseURL}/hidden/apply/backlog`;
    const resp = await this.gateway.get<LegacyServiceError<{ page: string; records: BacklogType[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  // 数据看板流程实例(故障报修)
  public async getFaultBacklog(payload: {
    pageNumber: number;
    pageSize: number;
    applicationCode: string;
    type?: string;
    status?: string;
    businessType?: string;
    period?: string;
  }): Promise<{ page: string; records: BacklogType[]; total: number }> {
    const url = `${baseURL}/fault/apply/backlog`;
    const resp = await this.gateway.get<LegacyServiceError<{ page: string; records: BacklogType[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  // 个人隐患排查工单
  public async getApplyPersonal(payload: {
    pageNumber: number;
    pageSize: number;
    type?: string;
    status?: string;
    businessType?: string;
  }): Promise<{ page: string; records: FaultListType[]; total: number }> {
    const url = `${baseURL}/hidden/apply/personal`;
    const resp = await this.gateway.get<LegacyServiceError<{ page: string; records: FaultListType[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  // 隐患统计
  public async getHiddenStatistics(payload: { period: string }): Promise<HiddenStatisticsType> {
    const url = `${baseURL}/hidden/statistics`;
    const resp = await this.gateway.get<LegacyServiceError<HiddenStatisticsType>>({ url, payload });
    return resp.data || resp;
  }

  // 故障单汇总信息
  public async getFaultSummary(payload: { period: string }): Promise<number> {
    const url = `${baseURL}/fault/stat/summary`;
    const resp = await this.gateway.get<number>({ url, payload });
    return resp;
  }

  // 巡更记录分页查询
  public async getElectronicPatrolsPage(payload: {
    pageNumber: number;
    pageSize: number;
    keyword: string;
    period: string;
  }): Promise<{ page: string; records: ElectronicPatrols[]; total: number }> {
    const url = `${baseURL}/electron/task/queryRecordPage`;
    const resp = await this.gateway.get<LegacyServiceError<{ page: string; records: ElectronicPatrols[]; total: number }>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  // 通过ID查询巡更记录
  public async getElectronTaskById(payload: { id: string }): Promise<TaskDetailType> {
    const url = `${baseURL}/electron/task/${payload.id}`;
    const resp = await this.gateway.get<LegacyServiceError<TaskDetailType>>({ url, payload });
    return resp.data || resp;
  }

  // 任务时段的路线
  public async getElectronTaskLocation(payload: { taskId: string; executePeriod: string }): Promise<ElectronTaskType[]> {
    const url = `${baseURL}/electron/task/location`;
    const resp = await this.gateway.get<LegacyServiceError<ElectronTaskType[]>>({ url, payload });
    return resp.data || resp;
  }

  // 日常巡检统计
  public async getInspectStatistics(payload: { type: string; period: string }): Promise<InspectStatistics> {
    const url = `${baseURL}/inspect-analysis/home-page/statistics`;
    const resp = await this.gateway.get<LegacyServiceError<InspectStatistics>>({ url, payload });
    return resp.data || resp;
  }

  // 巡检记录
  public async getInspectRecord(payload: {
    pageNumber: number;
    pageSize: number;
    keyword: string;
    result: string;
    taskIds?: string;
    userId?: string;
    status: string;
    period: string;
    businessType?: string;
  }): Promise<{ page: string; records: InspectRecord[]; total: number }> {
    const url = `${baseURL}/inspect-record/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ page: string; records: InspectRecord[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  // 巡检计划分析
  public async inspectionPlanAnalysis(payload: { period: string }): Promise<PlanAnalysis> {
    const url = `${baseURL}/inspection-analysis/inspectionPlanAnalysis`;
    const resp = await this.gateway.get<LegacyServiceError<PlanAnalysis>>({ url, payload });
    return resp.data || resp;
  }

  // 巡检任务分析
  public async inspectionTaskAnalysis(payload: { period: string }): Promise<TaskAnalysis> {
    const url = `${baseURL}/inspection-analysis/inspectionTaskAnalysis`;
    const resp = await this.gateway.get<LegacyServiceError<TaskAnalysis>>({ url, payload });
    return resp.data || resp;
  }

  // 巡检频率分析
  public async inspectionFrequencyAnalysis(payload: { period: string }): Promise<FrequencyAnalysis> {
    const url = `${baseURL}/inspection-analysis/inspectionFrequencyAnalysis`;
    const resp = await this.gateway.get<LegacyServiceError<FrequencyAnalysis>>({ url, payload });
    return resp.data || resp;
  }

  public async taskTimeAnalysis(payload: { period: string }): Promise<TaskTime> {
    const url = `${baseURL}/inspection-analysis/taskTimeAnalysis`;
    const resp = await this.gateway.get<LegacyServiceError<TaskTime>>({ url, payload });
    return resp.data || resp;
  }

  public async analysisOfAuditResults(payload: { period: string }): Promise<AnalysisOfAudit> {
    const url = `${baseURL}/inspection-analysis/analysisOfAuditResults`;
    const resp = await this.gateway.get<LegacyServiceError<AnalysisOfAudit>>({ url, payload });
    return resp.data || resp;
  }

  public async taskExecutionAnalysis(payload: { period: string }): Promise<TaskExecution> {
    const url = `${baseURL}/inspection-analysis/taskExecutionAnalysis`;
    const resp = await this.gateway.get<LegacyServiceError<TaskExecution>>({ url, payload });
    return resp.data || resp;
  }

  public async depTaskExecutionAnalysis(payload: { period: string }): Promise<DepTaskExecution> {
    const url = `${baseURL}/inspection-analysis/depTaskExecutionAnalysis`;
    const resp = await this.gateway.get<LegacyServiceError<DepTaskExecution>>({ url, payload });
    return resp.data || resp;
  }

  public async objInspectionTaskLast(payload: { period: string; objType?: string | undefined }): Promise<InspectionNum[]> {
    const url = `${baseURL}/inspection-analysis/objInspectionTaskLast`;
    const resp = await this.gateway.get<LegacyServiceError<InspectionNum[]>>({ url, payload });
    return resp.data || resp;
  }

  public async objInspectionTaskTop(payload: { period: string; objType?: string | undefined }): Promise<InspectionNum[]> {
    const url = `${baseURL}/inspection-analysis/objInspectionTaskTop`;
    const resp = await this.gateway.get<LegacyServiceError<InspectionNum[]>>({ url, payload });
    return resp.data || resp;
  }

  public async objAbnormalNumTop(payload: { period: string; objType?: string | undefined }): Promise<InspectionNum[]> {
    const url = `${baseURL}/inspection-analysis/objAbnormalNumTop`;
    const resp = await this.gateway.get<LegacyServiceError<InspectionNum[]>>({ url, payload });
    return resp.data || resp;
  }

  public async inspectionObjTaskAnalysis(payload: { period: string }): Promise<ObjTask> {
    const url = `${baseURL}/inspection-analysis/inspectionObjTaskAnalysis`;
    const resp = await this.gateway.get<LegacyServiceError<ObjTask>>({ url, payload });
    return resp.data || resp;
  }

  public async objInspectionNumTop(payload: { period: string; objType?: string | undefined }): Promise<InspectionNum[]> {
    const url = `${baseURL}/inspection-analysis/objInspectionNumTop`;
    const resp = await this.gateway.get<LegacyServiceError<InspectionNum[]>>({ url, payload });
    return resp.data || resp;
  }

  public async inspectionObjAbnormalAnalysis(payload: { period: string }): Promise<ObjAbnormal> {
    const url = `${baseURL}/inspection-analysis/inspectionObjAbnormalAnalysis`;
    const resp = await this.gateway.get<LegacyServiceError<ObjAbnormal>>({ url, payload });
    return resp.data || resp;
  }

  public async inspectionObjAnalysis(payload: { period: string }): Promise<ObjAnalysis> {
    const url = `${baseURL}/inspection-analysis/inspectionObjAnalysis`;
    const resp = await this.gateway.get<LegacyServiceError<ObjAnalysis>>({ url, payload });
    return resp.data || resp;
  }

  public async getTargetCategory(payload: { period: string }): Promise<TargetCategory[]> {
    const url = `${baseURL}/inspection-analysis/getTargetCategory`;
    const resp = await this.gateway.get<LegacyServiceError<TargetCategory[]>>({ url, payload });
    return resp.data || resp;
  }

  public async getTargetRecordDetail(payload: { targetId: string; businessType?: string }): Promise<RecordDetailResult> {
    const url = `${baseURL}/inspect-record/target-record-detail`;
    const resp = await this.gateway.get<LegacyServiceError<RecordDetailResult>>({ url, payload });
    return resp.data || resp;
  }

  // 巡更点查询
  public async patrolPage(payload: {
    pageNumber?: number;
    pageSize?: number;
    keyword?: string;
    areaId?: string;
  }): Promise<{ pages: number; records: PatrolLocationVO[]; total: number }> {
    const url = `${baseURL}/patrol/location/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ pages: number; records: PatrolLocationVO[]; total: number }>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  // 案例故障频次近十二月趋势
  public async faultRecentMonth(id: string): Promise<{ months: []; total: number }> {
    const url = `${baseURL}/get-fault-trend/${id}`;
    const resp = await this.gateway.get<LegacyServiceError<{ months: []; total: number }>>({ url });
    return resp.data || resp;
  }

  // 报告类型获取
  public async faultReportType(): Promise<unknown[]> {
    const url = `${baseURL}/getReportType`;
    const resp = await this.gateway.get<LegacyServiceError<unknown[]>>({ url });
    return resp.data || resp;
  }

  /**
   *
   * @returns 隐患程度列表
   */
  public async getProblemLevelList(): Promise<{ id: string; name: string }[]> {
    const url = `${baseURL}/hidden-danger-level/list`;
    const result = await this.gateway.get<LegacyServiceError<{ id: string; name: string }[]>>({ url });
    return result.data;
  }

  /**
   * 新增隐患程度
   */
  public async createProblemLevel(payload: { name: string }): Promise<void> {
    const url = `${baseURL}/hidden-danger-level`;
    await this.gateway.create<LegacyServiceError<void>>({ url, payload });
  }

  /**
   * 编辑隐患程度
   */
  public async updateProblemLevel(payload: { id: string; name: string }): Promise<void> {
    const url = `${baseURL}/hidden-danger-level/${payload.id}`;
    await this.gateway.update<LegacyServiceError<void>>({ url, payload });
  }

  /**
   * 删除隐患程度
   */
  public async deleteProblemLevel(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/hidden-danger-level/${payload.id}`;
    return this.gateway.delete({ url });
  }

  /**
   * 隐患分类列表
   */
  public async getDangerClassifyList(): Promise<{ id: string; name: string }[]> {
    const url = `${baseURL}/hidden-danger-category/list`;
    const result = await this.gateway.get<LegacyServiceError<{ id: string; name: string }[]>>({ url });
    return result.data;
  }

  /**
   * 新增隐患分类
   */
  public async createDangerClassify(payload: { name: string }): Promise<void> {
    const url = `${baseURL}/hidden-danger-category`;
    await this.gateway.create<LegacyServiceError<void>>({ url, payload });
  }

  /**
   * 更新隐患分类
   */
  public async updateDangerClassify(payload: { id: string; name: string }): Promise<void> {
    const url = `${baseURL}/hidden-danger-category/${payload.id}`;
    await this.gateway.update<LegacyServiceError<void>>({ url, payload });
  }

  /**
   * 删除隐患分类
   */
  public async deleteDangerClassify(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/hidden-danger-category/${payload.id}`;
    return this.gateway.delete({ url });
  }

  /**
   * 隐患类型列表
   */
  public async getDangerTypeList(payload?: { hiddenDangerCategoryId?: string }): Promise<HiddenDangerType[]> {
    const url = `${baseURL}/hidden-danger-type/list`;
    const result = await this.gateway.get<LegacyServiceError<HiddenDangerType[]>>({ url, payload });
    return result.data;
  }

  /**
   * 新增隐患类型
   */
  public async createDangerType(payload: {
    name: string;
    hiddenDangerCategoryId: string;
    hiddenDangerCategoryName: string;
  }): Promise<void> {
    const url = `${baseURL}/hidden-danger-type`;
    await this.gateway.create<LegacyServiceError<void>>({ url, payload });
  }

  /**
   * 更新隐患类型
   */
  public async updateDangerType(payload: {
    id: string;
    name: string;
    hiddenDangerCategoryId: string;
    hiddenDangerCategoryName: string;
  }): Promise<void> {
    const url = `${baseURL}/hidden-danger-type/${payload.id}`;
    await this.gateway.update<LegacyServiceError<void>>({ url, payload });
  }

  /**
   * 删除隐患类型
   */
  public async deleteDangerType(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/hidden-danger-type/${payload.id}`;
    return this.gateway.delete({ url });
  }

  /**
   * 委外报修工单列表
   */
  public async repairApplyPersonal(payload: {
    pageNumber: number;
    pageSize: number;
    businessType: string;
    submitTime: string;
  }): Promise<{ page: string; records: FaultListType[]; total: number }> {
    const url = `${baseURL}/outsource/apply/personal`;
    const resp = await this.gateway.get<LegacyServiceError<{ page: string; records: FaultListType[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }
  /**
   * 获取巡更点列表
   */
  public async getPatrolPointList(payload: {
    pageNumber: number;
    pageSize: number;
    areaId?: string;
  }): Promise<{ page: string; records: PatrolPointDTO[]; total: number }> {
    const url = `${baseURL}/patrol-point/list`;
    const resp = await this.gateway.get<LegacyServiceError<{ page: string; records: PatrolPointDTO[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }
}
