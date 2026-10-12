import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import type { BuildingDataVo, DeviceDataTypeVo, DeviceKnowledgeVo, MaintainStatistics } from "./types";

const baseURL = `${BASE_API}/device-center/supervise`;
const baseURL1 = `${BASE_API}`;

export class CubeDeviceSuperviseService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 生命事件-分页 */
  public async getDeviceLifeEvents(payload: {
    deviceId?: string;
    eventType?: string | undefined;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: unknown[]; total: number }> {
    const url = `${baseURL}/device-life-events/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /** 生命事件类型 */
  public async getDeviceLifeEventTypes(deviceId: string): Promise<unknown[]> {
    // const url = `${baseURL}/device-life-events/types`
    const url = `${baseURL}/device/${deviceId}/life-events/types`;
    const resp = await this.gateway.get<LegacyServiceError<unknown[]>>({ url });
    return resp.data || resp;
  }

  /** 知识文档 */
  public async getDeviceKnowledgeFile(payload: {
    deviceProdId?: string;
    deviceProdCategoryCodeConcat?: string;
    keyword?: string;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: DeviceKnowledgeVo[]; total: number }> {
    const url = `${baseURL1}/management/device-document/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: DeviceKnowledgeVo[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /**
   * 新增知识文档
   */
  public async createDeviceKnowledgeFile(payload: Record<string, unknown>): Promise<unknown> {
    const url = `${baseURL1}/management/device-document`;
    return this.gateway.create({ url, payload });
  }

  /**
   * 删除知识文档
   */
  public async deleteDeviceKnowledgeFile(id: string): Promise<unknown> {
    const url = `${baseURL1}/management/device-document/${id}`;
    return this.gateway.delete({ url });
  }

  /**
   * 批量删除知识文档
   */
  public async deleteDeviceKnowledgeFiles(ids: string[]): Promise<unknown> {
    const url = `${baseURL1}/management/device-document/batch`;
    return this.gateway.delete({ url, payload: { ids } });
  }

  /**
   * 获取建筑文档列表
   */
  public async getDeviceKnowledgeBuildingDataList(payload: {
    pageNumber: number;
    pageSize: number;
    keyword?: string;
    deptId?: string;
    areaId?: string;
    type?: string;
  }): Promise<{ records: BuildingDataVo[]; total: number }> {
    const url = `${baseURL1}/management/building-data/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: BuildingDataVo[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /**
   * 新增建筑文档
   */
  public async createDeviceKnowledgeBuildingFile(payload: Record<string, unknown>): Promise<unknown> {
    const url = `${baseURL1}/management/building-data`;
    return this.gateway.create({ url, payload });
  }

  /**
   * 删除建筑文档
   */
  public async deleteDeviceKnowledgeBuildingFile(id: string): Promise<unknown> {
    const url = `${baseURL1}/management/building-data/${id}`;
    return this.gateway.delete({ url });
  }

  /**
   * 资料类型列表
   */
  public async getKnowledgeDataTypeList(payload?: { keyword?: string }): Promise<DeviceDataTypeVo[]> {
    const url = `${baseURL1}/management//getList/BUILDING_DEVICE`;
    const resp = await this.gateway.get<LegacyServiceError<DeviceDataTypeVo[]>>({ url, payload });
    return resp.data || resp;
  }

  /**
   * 新增资料类型
   */
  public async createKnowledgeDataType(payload: Record<string, unknown>): Promise<unknown> {
    const url = `${baseURL1}/management/addModelTypeCommand`;
    return this.gateway.create({
      url,
      payload: {
        ...payload,
        modelType: "BUILDING_DEVICE",
      },
    });
  }

  /**
   * 修改资料类型
   */
  public async updateKnowledgeDataType(payload: Record<string, unknown>): Promise<unknown> {
    const url = `${baseURL1}/management/updateModelTypeCommand/${payload?.id}`;
    return this.gateway.update({
      url,
      payload: {
        ...payload,
        modelType: "BUILDING_DEVICE",
      },
    });
  }

  /**
   * 类型删除
   */
  public async deleteKnowledgeDataType(id: string): Promise<unknown> {
    const url = `${baseURL1}/management/removeModelType/${id}`;
    return this.gateway.delete({ url });
  }

  /** 设备健康分析分页列表-分页 */
  public async getHealthAnalysisPage(payload: {
    keyword?: string;
    anyMatchedAreaId?: string;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: unknown[]; total: number }> {
    const url = `${baseURL}/device/instance/analysis/health/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /** 健康报警通知配置-分页 */
  public async getAlarmConfigPage(payload: {
    keyword?: string;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: unknown[]; total: number }> {
    const url = `${baseURL}/device/instance/alarm/health/config/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /** 获取设备的报警配置 */
  public async getAlarmConfigDetail(deviceId: string): Promise<unknown> {
    const url = `${baseURL}/device/instance/${deviceId}/alarm/health/config`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return resp.data || resp;
  }

  /** 保存报警配置 */
  public async updateAlarmConfig(
    deviceId: string,
    payload: {
      alarmTypeId?: string | number | undefined;
      enable?: boolean;
      id?: string | undefined;
      levelId?: number | undefined;
      thresholdValue?: number | undefined;
      linkageEmergencyActionModifies?: unknown[];
    },
  ): Promise<void> {
    const url = `${baseURL}/device/instance/${deviceId}/alarm/health/config`;
    return this.gateway.custom({ method: "POST", url, payload });
  }

  /** 通知配置 - 启用/禁用 */
  public async updateDeviceHealthConfig(
    deviceInstanceId: string,
    payload: {
      flag: boolean;
    },
  ): Promise<unknown> {
    const url = `${baseURL}/device/instance/${deviceInstanceId}/alarm/health/config/enable?flag=${payload.flag}`;
    return this.gateway.update({ url, payload });
  }

  /** 报警级别列表 */
  public async getAlarmLevels(): Promise<
    {
      code: string;
      id: number;
      name: string;
      sort: number;
    }[]
  > {
    const url = `${baseURL1}/alarm/sat-alarm-levels`;
    const resp = await this.gateway.get<
      LegacyServiceError<
        {
          code: string;
          id: number;
          name: string;
          sort: number;
        }[]
      >
    >({ url });
    return resp.data || resp;
  }

  /** 通知列表-报警列表- 分页 */
  public async getAlarmRecordsPage(payload: {
    alarmStatus?: string | undefined;
    areaIds?: string | undefined;
    period?: string | undefined;
    applicationCode?: string | undefined;
    keyword?: string | undefined;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: unknown[]; total: number }> {
    const url = `${baseURL1}/alarm/alarm-records`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /** 报警 详情 */
  public async getAlarmRecordDetail(id: string, tenant?: string): Promise<unknown> {
    const url = `${baseURL1}/alarm/alarm-record/${id}`;
    const headers = tenant ? { headers: { tenant } } : {};
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      url,
      query: { id, tenant },
      method: "GET",
      ...headers,
    });
    return resp.data || resp;
  }

  /** 获取报警通知人员列表 */
  public async getAlaramNoticPersonnerList(businessKey: string): Promise<unknown[]> {
    const url = `${baseURL1}/alarm/alarm-record/targets/${businessKey}`;
    const resp = await this.gateway.get<LegacyServiceError<unknown[]>>({ url });
    return resp.data || resp;
  }

  /** 消息通知记录 */
  public async getMsgRecordTargets(businessKey: string): Promise<unknown[]> {
    const url = `${baseURL1}/message/msg-record/targets/${businessKey}`;
    const resp = await this.gateway.get<LegacyServiceError<unknown[]>>({ url });
    return resp.data || resp;
  }

  /** 获取报警流程日志列表 */
  public async getAlarmHandleProcess(eventId: string, tenant?: string): Promise<unknown[]> {
    const url = `${baseURL1}/alarm/alarm-record/operatorLogs/${eventId}`;
    const headers = tenant ? { headers: { tenant } } : {};
    const resp = await this.gateway.custom<LegacyServiceError<unknown[]>>({
      url,
      query: { eventId, tenant },
      method: "GET",
      ...headers,
    });
    return resp.data || resp;
  }

  /** 根据事件获取物联设备列表 */
  public async getIotDeviceListByEvent(eventId: string, tenant?: string): Promise<unknown[]> {
    const url = `${baseURL1}/linkage/event-iot-device-pros/${eventId}`;
    const headers = tenant ? { headers: { tenant } } : {};
    const resp = await this.gateway.custom<LegacyServiceError<unknown[]>>({
      url,
      query: { eventId, tenant },
      method: "GET",
      ...headers,
    });
    return resp.data || resp;
  }

  /** 手动控制 */
  public async manualControlIotDevice(payload: { eventIotDeviceId?: string; tenant?: string }): Promise<void> {
    const url = `${baseURL1}/linkage/event-iot-device-pro/ctrl`;
    const headers = payload.tenant ? { headers: { tenant: payload.tenant } } : {};
    await this.gateway.custom<LegacyServiceError<unknown>>({
      url,
      query: payload,
      method: "GET",
      ...headers,
    });
  }

  /** 根据事件获取物联设备执行记录 */
  public async getIotDeviceProRecords(eventId: string, tenant?: string): Promise<unknown[]> {
    const url = `${baseURL1}/linkage/event-iot-device-pro-records/${eventId}`;
    const headers = tenant ? { headers: { tenant } } : {};
    const resp = await this.gateway.custom<LegacyServiceError<unknown[]>>({
      url,
      query: { eventId, tenant },
      method: "GET",
      ...headers,
    });
    return resp.data || resp;
  }

  /** 根据事件获取摄像机动作执行附件列表 */
  public async getVideoEventAction(eventId: string): Promise<unknown[]> {
    const url = `${baseURL1}/linkage/event-video-file-paths/${eventId}`;
    const resp = await this.gateway.get<LegacyServiceError<unknown[]>>({ url });
    return resp.data || resp;
  }

  /** 设备可靠性分析 */
  public async deviceReliabilityAnalysis(payload: { deviceIds?: string; period?: string }): Promise<unknown[]> {
    const url = `${baseURL}/device/instance/analysis/reliability`;
    const resp = await this.gateway.get<LegacyServiceError<unknown[]>>({ url, payload });
    return resp.data || resp;
  }

  /** 设备可靠性分析-导出 */
  public async reliabilityAnalysisExport(payload: { deviceIds?: string[]; period?: string }): Promise<Blob> {
    const url = `${baseURL}/device/instance/analysis/reliability/export`;
    return this.gateway.customBlob({ method: "POST", url, payload });
  }

  /** 故障频次近十二月趋势 */
  public async getFaultTrend(id: string): Promise<unknown[]> {
    const url = `${baseURL1}/maintain/get-fault-trend/${id}`;
    const resp = await this.gateway.get<LegacyServiceError<unknown[]>>({ url });
    return resp.data || resp;
  }

  /** 设备运行统计 */
  public async deviceWorkStatistics(payload: {
    deviceId?: string | undefined;
    deviceState?: string | undefined;
    keyword?: string | undefined;
    productCategoryCode?: string | undefined;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: unknown[]; total: number }> {
    const url = `${baseURL1}/device-center/device/supervise/statistics`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }
  /** 维护统计 */
  public async deviceMaintainStatistics(payload: {
    anyMatchedAreaId?: string | undefined;
    deviceState?: string;
    keyword?: string | undefined;
    productCategoryCode?: string | undefined;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: MaintainStatistics[]; total: number }> {
    const url = `${baseURL1}/device-center/device/supervise/maintain/statistics`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: MaintainStatistics[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /**
   *设备劣化分析
   */
  public async disadvantageAnalysis(deviceId: string): Promise<{ time: string; value: number }[]> {
    const url = `${baseURL}/device/instance/${deviceId}/analysis/health/degradation/trend`;
    const resp = await this.gateway.get<LegacyServiceError<{ time: string; value: number }[]>>({ url });
    return resp.data || resp;
  }

  /** 历史健康趋势 */
  public async historyHealthTrend(payload: { deviceInstanceId?: string; period?: string }): Promise<unknown> {
    const url = `${baseURL}/device/instance/analysis/health/trend`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 设备健康分析 */
  public async getHealthProblems(id: string): Promise<unknown> {
    const url = `${baseURL}/device/instance/analysis/health/problems/latest/${id}`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return resp.data || resp;
  }

  /** 历史健康分析值分页 */
  public async historyHealthVlaue(payload: {
    deviceId?: string;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: unknown[]; total: number }> {
    const url = `${baseURL}/device/instance/analysis/health/historical/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /** 健康分析 重新检测 */
  public async retestCheck(payload: { deviceInstanceId?: string }): Promise<Blob> {
    const url = `${baseURL}/device/instance/${payload.deviceInstanceId}/analysis/health/computing`;
    return this.gateway.customBlob({ method: "POST", url, payload });
  }

  /** 设备运行统计-导出 */
  public async deviceWorkStatisticsExport(payload: {
    keyword?: string;
    productCategoryCode?: string | undefined;
    deviceState?: string | undefined;
    pageNumber: number;
    pageSize: number;
  }): Promise<Blob> {
    const url = `${baseURL1}/device-center/device/supervise/statistics/export?productCategoryCode=${payload.productCategoryCode ?? ""}&keyword=${payload.keyword ?? ""}&pageNumber=${payload.pageNumber}&pageSize=${payload.pageSize}&deviceState=${payload.deviceState ?? ""}`;
    return this.gateway.customBlob({ method: "GET", url, payload });
  }
  /** 设备维护统计-导出 */
  public async deviceMaintainStatisticsExport(payload: {
    deviceState?: string | undefined;
    keyword?: string;
    productCategoryCode?: string | undefined;
    anyMatchedAreaId?: string | undefined;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<Blob> {
    const url = `${baseURL1}/device-center/device/supervise/maintain/statistics/export?productCategoryCode=${payload.productCategoryCode ?? ""}&anyMatchedAreaId=${payload.anyMatchedAreaId ?? ""}&deviceState=${payload.deviceState ?? ""}&keyword=${payload.keyword ?? ""}&pageNumber=${payload.pageNumber}&pageSize=${payload.pageSize}`;
    return this.gateway.customBlob({ method: "GET", url, payload });
  }

  /** 报警确认 */
  public async alarmHandleConfirm(id: string): Promise<void> {
    const url = `${baseURL1}/alarm/alarm-record/confirmed/${id}`;
    await this.gateway.update({ url });
  }

  /** 报警处理 */
  public async alarmHandle(
    id: string,
    payload: {
      alarmHandlerResult?: string;
      alarmHandlerResultRemark?: string | undefined;
      fileVOS: string[];
    },
  ): Promise<void> {
    const url = `${baseURL1}/alarm/alarm-record/handler/${id}`;
    await this.gateway.update({ url, payload });
  }

  /** 报警挂起 */
  public async alarmHandleSuspend(
    id: string,
    payload: {
      estimatedProcessTime?: string;
      remark?: string | undefined;
      fileVOS: string[];
    },
  ): Promise<void> {
    const url = `${baseURL1}/alarm/alarm-record/suspend/${id}`;
    await this.gateway.update({ url, payload });
  }

  /** 报警移交 */
  public async alarmHandleTransfer(
    id: string,
    payload: {
      departmentId?: string;
      departmentName?: string | undefined;
      userId?: string | undefined;
      userName?: string | undefined;
    },
  ): Promise<void> {
    const url = `${baseURL1}/alarm/alarm-record/transfer/${id}`;
    await this.gateway.update({ url, payload });
  }

  // 平台消息通道配置列表
  public async getMsgChannelConfigs(payload: { satMsgDefineCode?: string | undefined }): Promise<unknown[]> {
    const url = `${baseURL1}/message/sat-msg-configs/channel/${payload.satMsgDefineCode}`;
    const resp = await this.gateway.get<LegacyServiceError<unknown[]>>({ url });
    return resp.data || resp;
  }

  /** 通知配置-分页 */
  public async getNotifyConfigPage(payload: {
    keyword?: string;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: unknown[]; total: number }> {
    const url = `${baseURL}/device-notify-rules`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /** 获取设备的通知配置 */
  public async getDeviceNotifyConfigDetail(deviceId: string): Promise<unknown> {
    const url = `${baseURL}/device-notify-rule/${deviceId}`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return resp.data || resp;
  }

  /** 通知配置 - 启用/禁用 */
  public async updateDeviceNotifyConfigEnable(payload: { id: string; enabled: boolean }): Promise<unknown> {
    const url = `${baseURL}/device-notify-rule/enable`;
    return this.gateway.update({ url, payload });
  }

  /** 保存通知配置 */
  public async updateDeviceNotifyConfig(payload: {
    enabled?: boolean;
    deviceId?: string | undefined;
    messageNotifies?: unknown[];
  }): Promise<void> {
    const url = `${baseURL}/device-notify-rule`;
    return this.gateway.custom({ method: "POST", url, payload });
  }

  /** 通知记录-分页 */
  public async getNotifyRecordPage(payload: {
    keyword?: string;
    period?: string;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: unknown[]; total: number }> {
    const url = `${baseURL}/notify-rule/trigger-records`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }
}
