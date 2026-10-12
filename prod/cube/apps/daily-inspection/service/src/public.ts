import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import type {
  MyInspectionType,
  PageResult,
  TaskDetailType,
  InspectRecord,
  InspectStandard,
  ScenePointVO,
  RecordPage,
  DetailRecordPage,
  QrcodeEntityVO,
  StandardVOS,
  StandardItemType,
  InspectRecordVo,
  StandardItem,
  StandardTypeRefer,
  InspectBusinessType,
  InspectResultItem,
  InspectStandardDetail,
  InspectItemDetail,
  InspectItemVO,
  InspectTaskRate,
  InspectRecordStatus,
  InspectRecordPageExportData,
  TaskObjCountResult,
  TaskInspectionObjRecord,
  TaskStandardAbnormalRate,
  InspectPlanStatisticsParam,
  PaginationInspectPlanStatisticsVO,
  BatchInspectStandardPayload,
  InspectRecordResultSource,
} from "./types";
const baseURL = `${BASE_API}/maintain`;
export interface ArchivesDetail {
  id: string;
  targetId: string;
  targetName: string;
  targetCategory: string;
  areaName: string;
  organizationName: string;
  time: number;
  result: string;
  dailyNum: number;
  dailyErrNum: number;
  dailyList: unknown[];
  temporaryNum: number;
  temporaryErrNum: number;
  temporaryList: unknown[];
}
export type InspectTaskRatePayload = {
  id: string;
  taskId?: string;
  businessType?: string;
  targetCategory?: string;
  status?: string;
  keyword?: string;
  result?: string;
  pageNumber?: number;
  pageSize?: number;
};

/** 日常巡检接口 */
export class CubeDailyInspectionService {
  private readonly gateway: CubeGateway;
  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 我的巡检 */
  public async MyInspectionPage(payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string | undefined;
    typeId?: string | undefined;
    targetCategory?: string | undefined;
    status?: string;
    period?: string | undefined;
    businessType?: string;
  }): Promise<PageResult<MyInspectionType>> {
    const url = `${baseURL}/inspect-task/mytask`;
    const resp = await this.gateway.get<LegacyServiceError<PageResult<MyInspectionType>>>({ url, payload });
    return resp.data || resp;
  }

  /**
   * 获取巡检计划列表
   * @param payload
   * @returns
   */
  public async getInspectPlanList(payload: {
    pageNumber: number;
    pageSize: number;
    status?: string;
    typeId?: string;
    keywords?: string;
    businessType?: string;
  }): Promise<{ records: Record<string, unknown>[]; total: number; pages: number }> {
    const url = `${baseURL}/inspect-plan/pageV2`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: Record<string, unknown>[]; total: number; pages: number }>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  /**
   * 新增巡检计划
   */
  public async createInspectPlan(payload: Record<string, unknown>): Promise<void> {
    const url = `${baseURL}/inspect-record/addV2`;
    await this.gateway.create({ url, payload });
  }

  /**
   * 修改巡检计划
   */
  public async updateInspectPlan(payload: Record<string, unknown>): Promise<void> {
    const url = `${baseURL}/inspect-plan/edit`;
    await this.gateway.create({ url, payload });
  }

  /**
   * 删除巡检计划
   */
  public async deleteInspectPlan(id: string, businessType?: string): Promise<void> {
    const url = `${baseURL}/inspect-plan/${id}?businessType=${businessType ?? ""}`;
    await this.gateway.delete({ url });
  }

  /**
   * 获取巡检计划详情
   */
  public async getInspectPlanDetail(payload: {
    id: string;
    businessType?: string;
    pageNumber?: number;
    pageSize?: number;
    targetCategory?: string;
    targetName?: string;
    notTarget?: boolean;
  }): Promise<Record<string, unknown>> {
    const url = `${baseURL}/inspect-plan/detailV2`;
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>>>({ url, payload });
    return resp.data || resp;
  }

  /**
   * 获取巡检任务列表
   */
  public async getInspectTaskList(payload: {
    pageNumber: number;
    pageSize: number;
    status?: string;
    period?: string;
    typeId?: string;
    keyword?: string;
    businessType?: string;
    taskTimeout?: string;
    droneInspection?: boolean;
  }): Promise<{ records: Record<string, unknown>[]; total: number; pages: number }> {
    const url = `${baseURL}/inspect-task/pageV2`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: Record<string, unknown>[]; total: number; pages: number }>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  /**
   * 导出巡检任务列表
   */
  public async getInspectTaskExport(payload: {
    pageNumber?: number;
    pageSize?: number;
    status?: string;
    period?: string;
    typeId?: string;
    keyword?: string;
    businessType?: string;
    taskTimeout?: string;
    droneInspection?: boolean;
  }): Promise<Blob> {
    const url = `${baseURL}/inspect-task/pageV2/export`;
    const resp = await this.gateway.customBlob({
      url,
      method: "POST",
      payload,
    });
    return resp;
  }

  /**
   *新增巡检任务
   */
  public async createInspectTask(payload: Record<string, unknown>): Promise<void> {
    const url = `${baseURL}/inspect-task/save`;
    await this.gateway.create({ url, payload });
  }

  /**
   * 停止巡检任务
   */
  public async stopInspectTask(payload: { id: string; businessType?: string }): Promise<void> {
    const url = `${baseURL}/inspect-task/${payload.id}/stop`;
    await this.gateway.update({ url, payload });
  }

  /** 巡检任务-批量删除 */
  public async deleteInspectTask(ids: string[]): Promise<void> {
    const url = `${baseURL}/inspect-task/remove-batch`;
    await this.gateway.custom<LegacyServiceError<unknown>>({ method: "PUT", url, payload: { idList: ids } });
  }
  /** 巡检任务-批量删除 */
  public async cancelRepairInspectTask(payload: {
    content?: string;
    fileIdList?: (string | number)[];
    repairStatus?: string;
    taskIdList: string[];
  }): Promise<void> {
    const url = `${baseURL}/inspect/repair/clean/task-ids`;
    await this.gateway.custom<LegacyServiceError<unknown>>({ method: "POST", url, payload });
  }

  /**
   * 获取巡检任务详情
   */
  public async getInspectTaskDetail(payload: { id: string; businessType?: string; notTarget?: boolean }): Promise<Record<string, unknown>> {
    const url = `${baseURL}/inspect-task/detailV2`;
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>>>({ url, payload });
    return resp.data || resp;
  }

  /**
   * 获取任务执行进度
   */
  public async getInspectTaskRate(payload: InspectTaskRatePayload): Promise<InspectTaskRate> {
    const url = `${baseURL}/inspect-task/detail-rateV2`;
    const resp = await this.gateway.get<LegacyServiceError<InspectTaskRate>>({ url, payload });
    return resp.data || resp;
  }

  /**
   * 导出任务执行进度
   */
  public async getInspectTaskRateExport(payload: InspectTaskRatePayload): Promise<Blob> {
    const url = `${baseURL}/inspect-task/detail-rateV2/export`;
    return this.gateway.customBlob({
      url,
      method: "POST",
      payload,
    });
  }

  /**
   * 巡检任务对象统计
   */
  public async getInspectTaskObjCount(payload: { taskId: string }): Promise<TaskObjCountResult> {
    const url = `${baseURL}/inspect-task/objCount`;
    const resp = await this.gateway.get<LegacyServiceError<TaskObjCountResult>>({ url, payload });
    return resp.data || resp;
  }

  /**
   * 获取巡检记录列表
   */
  public async getInspectRecordList(payload: {
    pageNumber: number;
    pageSize: number;
    temporary?: string;
    result?: string;
    keyword?: string;
    period?: string;
    businessType?: string;
    organizationId?: string;
    areaId?: string;
    taskIds?: string;
    targetCategory?: string;
    status?: InspectRecordStatus;
    resultSource?: InspectRecordResultSource;
    timeStart?: string;
    timeEnd?: string;
  }): Promise<{ records: InspectRecordVo[]; total: number; pages: number }> {
    const url = `${baseURL}/inspect-record/pagination`;
    const resp = await this.gateway.get<{ records: InspectRecordVo[]; total: number; pages: number }>({ url, payload });
    return resp;
  }

  /**
   * 获取巡检记录详情
   */
  public async getInspectRecordDetail(payload: { id: string; businessType?: string }): Promise<InspectRecordVo> {
    const url = `${baseURL}/inspect-record/${payload.id}`;
    const resp = await this.gateway.get<LegacyServiceError<InspectRecordVo>>({ url, payload });
    return resp.data || resp;
  }

  public async getInspectRecordExport(payload: {
    pageNumber: number;
    pageSize: number;
    temporary?: string;
    result?: string;
    keyword?: string;
    period?: string;
    businessType?: string;
    organizationId?: string;
    areaId?: string;
    taskIds?: string;
    targetCategory?: string;
    status?: InspectRecordStatus;
    resultSource?: InspectRecordResultSource;
    timeStart?: string;
    timeEnd?: string;
  }): Promise<InspectRecordPageExportData> {
    const url = `${baseURL}/inspect-record/page-export`;
    const resp = await this.gateway.get<InspectRecordPageExportData>({ url, payload });
    return resp;
  }

  /**
   * 获取巡检级别
   */
  public async getInspectLevelList(): Promise<
    {
      id: string;
      name: string;
    }[]
  > {
    const url = `${baseURL}/inspect/task/level`;
    const resp = await this.gateway.get<
      LegacyServiceError<
        {
          id: string;
          name: string;
        }[]
      >
    >({ url });
    return resp.data || resp;
  }

  /** 巡检类型列表数据 */
  public async getInspectTypeList(payload?: { businessType: string }): Promise<
    {
      id: string;
      name: string;
    }[]
  > {
    const url = `${baseURL}/inspect-type/list`;
    const resp = await this.gateway.get<
      LegacyServiceError<
        {
          id: string;
          name: string;
        }[]
      >
    >({ url, payload });
    return resp.data || resp;
  }

  /**
   * 巡检周期列表数据
   */
  public async getInspectPeriodList(payload?: { businessType: string }): Promise<
    {
      id: string;
      name: string;
    }[]
  > {
    const url = `${baseURL}/inspect-cron/list`;
    const resp = await this.gateway.get<
      LegacyServiceError<
        {
          id: string;
          name: string;
        }[]
      >
    >({ url, payload });
    return resp.data || resp;
  }

  /** 接收 */
  public async AcceptTask(payload: { id: string; businessType?: string }): Promise<PageResult<MyInspectionType>> {
    const url = `${baseURL}/inspect-task/${payload.id}/accept`;
    const resp = await this.gateway.update<LegacyServiceError<PageResult<MyInspectionType>>>({ url, payload });
    return resp.data || resp;
  }

  /** 移交 */
  public async TransferTask(payload: { id: string; userId: string; businessType?: string }): Promise<PageResult<MyInspectionType>> {
    const url = `${baseURL}/inspect-task/${payload.id}/turnOver/${payload.userId}`;
    const resp = await this.gateway.update<LegacyServiceError<PageResult<MyInspectionType>>>({ url, payload });
    return resp.data || resp;
  }

  /** 添加协同人 */
  public async AddPartner(payload: { id: string; userId: string; businessType?: string }): Promise<PageResult<MyInspectionType>> {
    const url = `${baseURL}/inspect-task/${payload.id}/addCollaborator?userId=${payload.userId}`;
    const resp = await this.gateway.update<LegacyServiceError<PageResult<MyInspectionType>>>({ url, payload });
    return resp.data || resp;
  }

  public async checkPlanNameRepeat(payload: { planName: string; businessType?: string }): Promise<boolean> {
    const url = `${baseURL}/inspect-plan/checkPlanNameIsRepeat`;
    const resp = await this.gateway.get<{ data: boolean }>({ url, payload });
    return resp.data;
  }

  public async updatePlanStatus(payload: { id: string; startFlag: boolean; businessType?: string }): Promise<boolean> {
    const url = `${baseURL}/inspect-plan/${payload.id}/start/${payload.startFlag}`;
    const resp = await this.gateway.update<boolean>({ url, payload });
    return resp;
  }

  /** 巡检任务详情 */
  public async TaskDetail(payload: { id: string; businessType?: string }): Promise<TaskDetailType> {
    const url = `${baseURL}/inspect-task/appTaskDetail/${payload.id}`;
    const resp = await this.gateway.get<LegacyServiceError<TaskDetailType>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检任务详情-巡检对象分页列表 */
  public async TaskInspectionObjPage(payload: {
    /** 巡检任务 id */
    id: string;
    pageNumber: number;
    pageSize: number;
    keyword?: string;
    status?: string;
    result?: string;
    businessType?: string;
  }): Promise<PageResult<TaskInspectionObjRecord>> {
    const url = `${baseURL}/inspect-task/inspection-obj`;
    const resp = await this.gateway.get<LegacyServiceError<PageResult<TaskInspectionObjRecord>>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检记录 */
  public async InspectRecord(payload: { id: string; businessType?: string }): Promise<InspectRecord> {
    const url = `${baseURL}/inspect-record/${payload.id}`;
    const resp = await this.gateway.get<LegacyServiceError<InspectRecord>>({ url, payload });
    return resp.data || resp;
  }

  /** 执行巡检-详情 */
  public async InspectExecuteDetail(payload: { id: string; objId: string; businessType?: string }): Promise<InspectStandard> {
    const url = `${baseURL}/inspect-task/${payload.id}/performInspection`;
    const resp = await this.gateway.get<LegacyServiceError<InspectStandard>>({ url, payload });
    return resp.data || resp;
  }

  /** 执行巡检-临时巡检详情 */
  public async InspectTemporaryExecuteDetail(targetId: string, targetCategory: string, businessType?: string): Promise<InspectStandard> {
    const url = `${baseURL}/inspect-standard/${targetCategory}/${targetId}`;
    const resp = await this.gateway.get<LegacyServiceError<InspectStandard>>({ url, payload: { businessType } });
    return resp.data || resp;
  }

  /** 判断巡检记录是否过期 */
  public async InspectIsExpired(id: string): Promise<boolean | null> {
    const url = `${baseURL}/inspect-record/recordIsExpired/${id}`;
    const resp = await this.gateway.get<boolean | null>({ url });
    return resp;
  }

  /** 巡检记录提交 */
  public async InspectRecordSubmit(
    id: string,
    payload: {
      tempAddFlag: boolean;
      standardId: number | string;
      standardName: string;
      itemId: number | string;
      itemName: string;
      itemImageResult: string;
      remarkResult: string;
      itemResultId: number | string;
      itemResultValue: string;
      itemResultName: string;
      errorValueFlag: boolean;
      errorDesc: string;
      fileIds: string[];
    }[],
  ): Promise<InspectStandard> {
    const url = `${baseURL}/inspect-record/${id}/submit`;
    const resp = await this.gateway.create<LegacyServiceError<InspectStandard>>({ url, payload });
    return resp.data || resp;
  }

  /** 批量提交巡检 */
  public async taskSubmitList(payload: {
    commandList: {
      recordId: string;
      resultSource?: InspectRecordResultSource;
      commandModels: StandardItemType[];
    }[];
    businessType?: string;
    resultSource?: InspectRecordResultSource;
  }): Promise<InspectStandard> {
    const url = "/api/maintain/inspect-record/task-submit/list";
    const resp = await this.gateway.create<LegacyServiceError<InspectStandard>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检提交前校验 */
  public async taskSubmitCheck(payload: { recordIdList: (string | number)[] }): Promise<boolean> {
    const url = `${baseURL}/inspect-record/task-submit/check`;
    const resp = await this.gateway.create<boolean>({ url, payload });
    return resp;
  }

  /** 批量提交临时巡检 */
  public async taskTempSubmitList(payload: {
    commandList: {
      targetCategory: string;
      targetId: string;
      areaId: string;
      areaName: string;
      targetName: string;
      recordId: string;
      resultSource?: InspectRecordResultSource;
      commandModels: StandardItemType[];
    }[];
    businessType?: string;
    resultSource?: InspectRecordResultSource;
  }): Promise<InspectStandard> {
    const url = "/api/maintain/inspect-record/temp-submit/list";
    const resp = await this.gateway.create<LegacyServiceError<InspectStandard>>({ url, payload });
    return resp.data || resp;
  }

  /** 临时巡检记录提交 */
  public async InspectTemporaryFormSubmit(payload: {
    targetId: string;
    targetCategory: string;
    targetName: string;
    areaId: string;
    areaName: string;
    resultSource?: InspectRecordResultSource;
    commandModels: StandardItemType[];
  }): Promise<InspectStandard> {
    const url = `${baseURL}/inspect-record/submit/new`;
    const resp = await this.gateway.create<LegacyServiceError<InspectStandard>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检标准分页 */
  public async InspectStandardPage(payload: {
    pageNumber: number;
    pageSize: number;
    keyword: string;
    targetCategory?: string;
    targetType?: string;
    flagDetails?: boolean;
    businessType?: string;
  }): Promise<{
    pages: number;
    records: StandardVOS[];
    total: number;
  }> {
    const url = `${baseURL}/inspect-standard/page`;
    const resp = await this.gateway.get<
      LegacyServiceError<{
        pages: number;
        records: StandardVOS[];
        total: number;
      }>
    >({ url, payload });
    return resp.data || resp;
  }

  /** 巡检项分页 */
  public async getInspectStandardItemPage(payload: {
    pageNumber: number;
    pageSize: number;
    keyword: string;
    referType?: string;
    businessType?: string;
  }): Promise<{
    pages: number;
    records: StandardItemType[];
    total: number;
  }> {
    const url = `${baseURL}/inspect-item-template/page`;
    const resp = await this.gateway.get<
      LegacyServiceError<{
        pages: number;
        records: StandardItemType[];
        total: number;
      }>
    >({ url, payload });
    return resp.data || resp;
  }

  /** 现场点详情 */
  public async getScenePointDetail(payload: { id: string }): Promise<ScenePointVO> {
    const url = `${baseURL}/inspect/detail/${payload.id}`;
    const resp = await this.gateway.get<LegacyServiceError<ScenePointVO>>({ url });
    return resp.data || resp;
  }

  // 巡检档案分页列表
  public async targetRecordPage(payload: {
    pageSize: number;
    pageNumber: number;
    targetId?: string;
    keyword?: string | undefined;
    period?: string;
    targetCategory?: string;
    areaId?: string;
    resultSource?: InspectRecordResultSource;
  }): Promise<{ total: number; pages: number; records: RecordPage[] }> {
    const url = `${baseURL}/inspect-record/target-record-page`;
    const resp = await this.gateway.get<LegacyServiceError<{ total: number; pages: number; records: RecordPage[] }>>({ url, payload });
    return resp.data || resp;
  }

  /**
   * 任务标准项异常率统计
   */
  public async getTaskStandardAbnormalRate(payload: {
    pageSize: number;
    pageNumber: number;
    standardName?: string;
    period?: string;
  }): Promise<{ total: number; pages: number; records: TaskStandardAbnormalRate[] }> {
    const url = `${baseURL}/statistic-analysis/taskStandardAbnormalRate`;
    const resp = await this.gateway.get<LegacyServiceError<{ total: number; pages: number; records: TaskStandardAbnormalRate[] }>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  /**
   * 任务标准项异常率统计导出
   */
  public async getTaskStandardAbnormalRateExport(payload: {
    pageSize: number;
    pageNumber: number;
    standardName?: string;
    period?: string;
  }): Promise<Blob> {
    const url = `${baseURL}/statistic-analysis/taskStandardAbnormalRateExport`;
    const resp = await this.gateway.customBlob({
      url,
      method: "GET",
      payload,
    });
    return resp;
  }

  /**
   * 计划统计
   */
  public async getPlanStatistics(payload: InspectPlanStatisticsParam): Promise<PaginationInspectPlanStatisticsVO> {
    const url = `${baseURL}/statistic-analysis/planStatistics`;
    const resp = await this.gateway.get<LegacyServiceError<PaginationInspectPlanStatisticsVO>>({
      url,
      payload: payload as unknown as Record<string, unknown>,
    });
    return resp.data || resp;
  }

  /**
   * 计划统计导出
   */
  public async getPlanStatisticsExport(payload: InspectPlanStatisticsParam): Promise<Blob> {
    const url = `${baseURL}/statistic-analysis/planStatisticsExport`;
    const resp = await this.gateway.customBlob({
      url,
      method: "POST",
      payload: payload as unknown as Record<string, unknown>,
    });
    return resp;
  }

  // 巡检报修数下钻
  public async ObjStatisticsRepairsDetail(payload: {
    pageSize: number;
    pageNumber: number;
    targetId: string;
    period: string;
  }): Promise<{ total: number; records: RecordPage[] }> {
    const url = `${baseURL}/inspection-analysis/getInspectionStandardTtem`;
    const resp = await this.gateway.get<LegacyServiceError<{ total: number; records: RecordPage[] }>>({ url, payload });
    return resp.data || resp;
  }

  // 巡检档案详情
  public async detailRecordPage(payload: {
    pageSize: number;
    pageNumber: number;
    targetId?: string;
    temporary?: string;
    keyword?: string;
    result?: string;
    businessType?: string;
  }): Promise<{ total: number; records: DetailRecordPage[]; pages: number }> {
    const url = `${baseURL}/inspect-record/detail-recordPage`;
    const resp = await this.gateway.get<LegacyServiceError<{ total: number; pages: number; records: DetailRecordPage[] }>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  // 日常巡检-某个对象巡检统计
  public async detailStatistics(payload: { targetId: string; period?: string }): Promise<{ totalNum: number; abnormalNum: number }> {
    const url = `${baseURL}/inspect-analysis/object-details/statistics`;
    const resp = await this.gateway.get<LegacyServiceError<{ totalNum: number; abnormalNum: number }>>({ url, payload });
    return resp.data || resp;
  }

  /**
   * 获取生成二维码实体
   * @param code
   * @returns
   */
  public async getEntityByCode(code: string): Promise<QrcodeEntityVO> {
    const url = `/api/identity/qrcode/code?code=${code}`;
    const result = await this.gateway.get<LegacyServiceError<QrcodeEntityVO>>({ url });
    return result.data || result;
  }

  /**
   * 获取巡检档案详情
   */
  public async getInspectArchivesDetail(payload: {
    targetId: string;
    businessType?: string;
    targetCategory?: string;
  }): Promise<ArchivesDetail> {
    const url = `${baseURL}/inspect-record/target-record-detail`;
    const resp = await this.gateway.get<LegacyServiceError<ArchivesDetail>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检记录转其他业务 */
  public async InspectRecordToBusiness(
    id: string,
    payload: {
      targetCategory: string;
      targetId: string;
      targetName: string;
      businessCategory: string;
      businessId: string;
      businessType?: string;
      businessName: string;
    },
  ): Promise<InspectStandard> {
    const url = `${baseURL}/inspect-record/${id}/toBusiness`;
    const resp = await this.gateway.create<LegacyServiceError<InspectStandard>>({ url, payload });
    return resp.data || resp;
  }

  /** 对象巡检任务 */
  public async ObjectInspectionPage(
    targetId: string,
    targetCategory: string,
    payload: {
      pageSize: number;
      pageNumber: number;
      status?: string;
    },
  ): Promise<PageResult<TaskDetailType>> {
    const url = `${baseURL}/inspect-task/${targetCategory}/${targetId}/page`;
    const resp = await this.gateway.get<LegacyServiceError<PageResult<TaskDetailType>>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检类型-分页 */
  public async getInspectTypePage(payload: {
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
    businessType?: InspectBusinessType;
  }): Promise<{ records: unknown[]; total: number; pages: number }> {
    const url = `${baseURL}/inspect-type/page`;
    const resp = await this.gateway.get<LegacyServiceError<PageResult<unknown>>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检类型 详情 */
  public async getInspectTypeDetail(
    id: string,
    payload?: {
      businessType?: InspectBusinessType;
    },
  ): Promise<unknown> {
    const url = `${baseURL}/inspect-type/${id}`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检类型-更新 */
  public async updateInspectType(
    id: string,
    payload: {
      name: string;
      businessType?: InspectBusinessType;
    },
  ): Promise<void> {
    const url = `${baseURL}/inspect-type/${id}`;
    await this.gateway.update({ url, payload });
  }

  /** 巡检类型-新增 */
  public async addInspectType(payload: { name: string; businessType?: InspectBusinessType }): Promise<unknown> {
    const url = `${baseURL}/inspect-type`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检类型-删除 */
  public async deleteInspectType(
    id: string,
    payload?: {
      businessType?: InspectBusinessType;
    },
  ): Promise<void> {
    const url = `${baseURL}/inspect-type/${id}`;
    await this.gateway.delete({ url, payload });
  }

  /** 巡检周期-分页 */
  public async getInspectCronPage(payload: {
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
    businessType?: InspectBusinessType;
  }): Promise<{ records: unknown[]; total: number; pages: number }> {
    const url = `${baseURL}/inspect-cron/page`;
    const resp = await this.gateway.get<LegacyServiceError<PageResult<unknown>>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检周期 详情 */
  public async getInspectCronDetail(
    id: string,
    payload?: {
      businessType?: InspectBusinessType;
    },
  ): Promise<unknown> {
    const url = `${baseURL}/inspect-cron/${id}`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检周期-更新 */
  public async updateInspectCron(
    id: string,
    payload: {
      name: string;
      cron: string;
      description: string;
      businessType?: InspectBusinessType;
    },
  ): Promise<void> {
    const url = `${baseURL}/inspect-cron/${id}`;
    await this.gateway.update({ url, payload });
  }

  /** 巡检周期-新增 */
  public async addInspectCron(payload: {
    name: string;
    cron: string;
    description: string;
    businessType?: InspectBusinessType;
  }): Promise<unknown> {
    const url = `${baseURL}/inspect-cron`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检周期-删除 */
  public async deleteInspectCron(
    id: string,
    payload?: {
      businessType?: InspectBusinessType;
    },
  ): Promise<void> {
    const url = `${baseURL}/inspect-cron/${id}`;
    await this.gateway.delete({ url, payload });
  }

  /** 巡检周期-批量删除 */
  public async batchDeleteInspectCron(payload: { ids: string; businessType?: InspectBusinessType }): Promise<void> {
    const url = `${baseURL}/inspect-cron/batch`;
    await this.gateway.delete({ url, payload });
  }

  /** 巡检结果-分页 */
  public async getInspectResultPage(payload: {
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
    businessType?: InspectBusinessType;
  }): Promise<{ records: InspectResultItem[]; total: number; pages: number }> {
    const url = `${baseURL}/inspect-result/page`;
    const resp = await this.gateway.get<LegacyServiceError<PageResult<InspectResultItem>>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检结果-列表 */
  public async getInspectResultList(businessType?: InspectBusinessType): Promise<InspectResultItem[]> {
    const url = `${baseURL}/inspect-result/list`;
    const resp = await this.gateway.get<LegacyServiceError<InspectResultItem[]>>({ url, payload: { businessType } });
    return resp.data || resp;
  }

  /** 巡检结果 详情 */
  public async getInspectResultDetail(
    id: string,
    payload?: {
      businessType?: InspectBusinessType;
    },
  ): Promise<unknown> {
    const url = `${baseURL}/inspect-result/${id}`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 通过结果ID查询选项 */
  public async getInspectResultOptions(
    id: string,
    payload?: {
      businessType?: InspectBusinessType;
    },
  ): Promise<unknown> {
    const url = `${baseURL}/inspect-result/${id}/options`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检结果-更新 */
  public async updateInspectResult(
    id: string,
    payload: {
      code: string | undefined;
      enable: boolean | undefined;
      name: string | undefined;
      options: {
        errorFlag: boolean | undefined;
        itemName: string | undefined;
        itemValue: string | undefined;
        key: string | undefined;
      }[];
      businessType?: InspectBusinessType;
    },
  ): Promise<void> {
    const url = `${baseURL}/inspect-result/${id}`;
    await this.gateway.update({ url, payload });
  }

  /** 巡检结果-新增 */
  public async addInspectResult(payload: {
    code: string | undefined;
    enable: boolean | undefined;
    name: string | undefined;
    options: {
      errorFlag: boolean | undefined;
      itemName: string | undefined;
      itemValue: string | undefined;
      key: string | undefined;
    }[];
    businessType?: InspectBusinessType;
  }): Promise<unknown> {
    const url = `${baseURL}/inspect-result`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检结果-删除 */
  public async deleteInspectResult(
    id: string,
    payload?: {
      businessType?: InspectBusinessType;
    },
  ): Promise<void> {
    const url = `${baseURL}/inspect-result/${id}`;
    await this.gateway.delete({ url, payload });
  }

  /** 巡检项-分页 */
  public async getInspectItemTemplatePage(payload: {
    keyword?: string;
    referType?: string;
    pageNumber?: number;
    pageSize?: number;
    businessType?: InspectBusinessType;
  }): Promise<{ records: InspectItemVO[]; total: number; pages: number }> {
    const url = `${baseURL}/inspect-item-template/page`;
    const resp = await this.gateway.get<LegacyServiceError<PageResult<InspectItemVO>>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检项 详情 */
  public async getInspectItemTemplateDetail(
    id: string,
    payload?: {
      businessType?: InspectBusinessType;
    },
  ): Promise<InspectItemDetail> {
    const url = `${baseURL}/inspect-item-template/${id}/detail`;
    const resp = await this.gateway.get<LegacyServiceError<InspectItemDetail>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检项-更新 */
  public async updateInspectItemTemplate(
    id: string,
    payload: {
      alias: string | undefined;
      referType?: InspectBusinessType;
      isResultItem?: boolean;
      items: {
        imageFlag?: boolean | undefined;
        name?: string | undefined;
        resultId?: string | null | undefined;
        resultItemValue?: string | null | undefined;
        itemTag?: string | null | undefined;
        imageResult?: string | boolean | null | undefined;
        remarkResult?: string | boolean | null | undefined;
        businessType?: InspectBusinessType | undefined;
      }[];
    },
  ): Promise<void> {
    const url = `${baseURL}/inspect-item-template/standard/${id}`;
    await this.gateway.update({ url, payload });
  }

  /** 巡检项-新增 */
  public async addInspectItemTemplate(payload: {
    alias: string | undefined;
    referType?: InspectBusinessType;
    isResultItem?: boolean;
    items: {
      imageFlag?: boolean | undefined;
      name?: string | undefined;
      resultId?: string | null | undefined;
      resultItemValue?: string | null | undefined;
      itemTag?: string | null | undefined;
      imageResult?: string | boolean | null | undefined;
      remarkResult?: string | boolean | null | undefined;
      businessType?: InspectBusinessType | undefined;
    }[];
  }): Promise<unknown> {
    const url = `${baseURL}/inspect-item-template`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检项-删除 */
  public async deleteInspectItemTemplate(
    id: string,
    payload?: {
      businessType?: InspectBusinessType;
    },
  ): Promise<void> {
    const url = `${baseURL}/inspect-item-template/${id}`;
    await this.gateway.delete({ url, payload });
  }

  /** 巡检标准-分页 */
  public async getInspectStandardPage(payload: {
    keyword?: string;
    targetCategory?: string;
    targetType?: string;
    pageNumber?: number;
    pageSize?: number;
    targetTypeEq?: boolean;
    businessType?: InspectBusinessType;
  }): Promise<{ records: unknown[]; total: number; pages: number }> {
    const url = `${baseURL}/inspect-standard/page`;
    const resp = await this.gateway.get<LegacyServiceError<PageResult<unknown>>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检标准-列表 */
  public async getInspectStandardList(payload: {
    keyword?: string;
    targetCategory?: string;
    targetType?: string;
    businessType?: InspectBusinessType;
  }): Promise<unknown[]> {
    const url = `${baseURL}/inspect-standard/list`;
    const resp = await this.gateway.get<LegacyServiceError<unknown[]>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检标准 详情 */
  public async getInspectStandardDetail(
    id: string,
    payload?: {
      businessType?: InspectBusinessType;
    },
  ): Promise<InspectStandardDetail> {
    const url = `${baseURL}/inspect-standard/${id}`;
    const resp = await this.gateway.get<LegacyServiceError<InspectStandardDetail>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检标准-更新 */
  public async updateInspectStandard(
    id: string,
    payload: {
      name: string | undefined;
      remark: string | undefined;
      safetyTips?: string | undefined;
      standardItems: StandardItem[] | undefined;
      standardTypeRefers: StandardTypeRefer[] | undefined;
      businessType?: InspectBusinessType;
    },
  ): Promise<void> {
    const url = `${baseURL}/inspect-standard/${id}`;
    await this.gateway.update({ url, payload });
  }

  /** 巡检标准-新增 */
  public async addInspectStandard(payload: {
    name: string | undefined;
    remark: string | undefined;
    safetyTips?: string | undefined;
    standardItems: StandardItem[] | undefined;
    standardTypeRefers: StandardTypeRefer[] | undefined;
    businessType?: InspectBusinessType;
  }): Promise<unknown> {
    const url = `${baseURL}/inspect-standard`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检标准-批量新增 */
  public async batchAddInspectStandard(payload: BatchInspectStandardPayload): Promise<unknown> {
    const url = `${baseURL}/inspect-standard/batch`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检标准-关联 */
  public async relatedInspectStandard(payload: {
    targetType: string | undefined;
    targetCategory: string | undefined;
    standardIds: (string | number)[] | undefined;
    businessType?: InspectBusinessType;
  }): Promise<unknown> {
    const url = `${baseURL}/inspect-standard/type`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检标准-设置未默认巡检标准 */
  public async setDefaultStandard(payload: {
    targetType?: string | undefined;
    targetCategory?: string | undefined;
    defaultStandard?: number | undefined;
    standardId?: string | number | undefined;
    businessType?: InspectBusinessType;
  }): Promise<unknown> {
    const url = `${baseURL}/inspect-standard/defaultStandard`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 巡检标准-删除 */
  public async deleteInspectStandard(
    id: string,
    payload?: {
      businessType?: InspectBusinessType;
    },
  ): Promise<void> {
    const url = `${baseURL}/inspect-standard/${id}`;
    await this.gateway.delete({ url, payload });
  }
  /**
   * 获取巡检标准
   */
  public async getInspectStandard(payload: {
    targetCategory?: string;
    targetType?: string;
    businessType?: InspectBusinessType;
  }): Promise<InspectStandardDetail[]> {
    const url = `${baseURL}/inspect-standard/targetCategory/${payload.targetCategory}/targetType/${payload.targetType}`;
    const resp = await this.gateway.get<LegacyServiceError<InspectStandardDetail[]>>({ url, payload });
    return resp.data || resp;
  }

  /**
   * 获取异常对象
   */
  public async getRepairPage(payload: {
    pageSize: number;
    pageNumber: number;
    targetName?: string | undefined;
    recordId?: string | undefined;
    repairStatus?: string | undefined;
  }): Promise<PageResult<any>> {
    const url = `${baseURL}/inspect/repair/page`;
    const resp = await this.gateway.get<PageResult<any>>({ url, payload });
    return resp;
  }

  /**
   * 获取异常对象详情
   */
  public async getRepairDetail(payload: { recordId: string }): Promise<any> {
    const url = `${baseURL}/inspect/repair/detail`;
    const resp = await this.gateway.get<any>({ url, payload });
    return resp;
  }
  /**
   * 获取异常对象处理
   */
  public async updateRepair(payload: {
    repairStatus: string;
    content: string;
    fileIdList: string[];
    recordIdList: string[];
  }): Promise<any> {
    const url = `${baseURL}/inspect/repair/batch-submit`;
    const resp = await this.gateway.create<any>({ url, payload });
    return resp;
  }
  /**
   * 获取异常对象取消修复
   */
  public async cancelRepair(payload: {
    repairStatus: string;
    content: string;
    fileIdList: string[];
    recordIdList: string[];
  }): Promise<any> {
    const url = `${baseURL}/inspect/repair/batch-clean`;
    const resp = await this.gateway.create<any>({ url, payload });
    return resp;
  }
  /**
   * 取消巡检
   */
  public async cancelInspect(payload: { content: string; fileIdList: string[]; recordIdList: string[] }): Promise<any> {
    const url = `${baseURL}/inspect-record/batch/cancel-inspect`;
    const resp = await this.gateway.update<any>({ url, payload });
    return resp;
  }
  /**
   * 巡检移交
   */
  public async inspectTransfer(payload: { userId: string; ids: string[] }): Promise<any> {
    const url = `${baseURL}/inspect/repair/transfer`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp;
  }

  /** 现场点-缺失经纬度时更新经纬度 */
  public async updateSitePointLatAndLonIfAbsent(payload: { id: string; latAndLon: string; location: string }): Promise<void> {
    const url = `${baseURL}/inspect/updateLatAndLonIfAbsent`;
    await this.gateway.update<LegacyServiceError<void>>({ url, payload });
  }
}
