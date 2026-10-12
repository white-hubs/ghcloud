import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import type {
  ElectronTaskVo,
  PageResult,
  ElectronTaskDetailVo,
  PatrolPointVo,
  ElectronPatrolStat,
  AreaType,
  GpsPatrolMatchRequest,
  GpsPatrolMatchResponse,
  PatrolLocationLatAndLonUpdatePayload,
} from "./types";
const baseURL = `${BASE_API}/maintain`;

export class CubeElectronPatrolService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  public objectToUrlParams(paramsObj: Record<string, string | number | boolean>): string {
    return Object.keys(paramsObj)
      .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(paramsObj[key]))
      .join("&");
  }

  /** 巡更记录 导出 */
  public async exportElectronRecord(payload: {
    pageSize: number;
    pageNumber: number;
    period?: string;
    keyword?: string;
    depId?: string;
  }): Promise<Blob> {
    const url = `${baseURL}/electron/task/queryRecordExport`;
    return this.gateway.customBlob({ method: "GET", url, payload });
  }

  /** 巡更路线统计 导出 */
  public async exportElectronRoute(payload: { pageSize: number; pageNumber: number; period?: string; keyword?: string }): Promise<Blob> {
    const url = `${baseURL}/electron/statistics/patrolRouteExport?${this.objectToUrlParams(payload)}`;
    return this.gateway.customBlob({ method: "GET", url, payload });
  }

  /** 巡更路线统计 分页 */
  public async getElectronRoutePage(payload: {
    pageSize: number;
    pageNumber: number;
    period?: string;
    keyword?: string;
  }): Promise<{ records: unknown[]; total: number }> {
    const url = `${baseURL}/electron/statistics/patrolRoute`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /**
   * 巡更任务概览
   */
  public async getElectronTaskOverview(): Promise<Record<string, number>> {
    const url = `${baseURL}/electron/task/overview`;
    const resp = await this.gateway.get<
      LegacyServiceError<{
        total: number; // 总任务数
        toBeReceived: number; // 待接收任务数
        inExecution: number; // 进行中任务数
        finished: number; // 已完成任务数
      }>
    >({ url, payload: { admin: true } });
    return resp.data || resp;
  }

  /**
   * 巡更任务列表
   */
  public async getElectronTaskList(payload: {
    pageSize: number;
    pageNumber: number;
    period: string;
    keyword: string;
    taskState: string;
  }): Promise<PageResult<ElectronTaskVo>> {
    const url = `${baseURL}/electron/task/queryTaskPage`;
    const resp = await this.gateway.get<PageResult<ElectronTaskVo>>({ url, payload: { ...payload, admin: true } });
    return resp;
  }

  /**
   * 添加协同人
   */
  public async addElectronTaskCooperate(payload: { taskId: string; userId: string }): Promise<unknown> {
    const url = `${baseURL}/electron/${payload.taskId}/addCollaborator?userId=${payload.userId}`;
    const resp = await this.gateway.update<LegacyServiceError<unknown>>({ url });
    return resp.data || resp;
  }

  /**
   * 转交任务
   */
  public async transferElectronTask(payload: { taskId: string; userId: string }): Promise<unknown> {
    const url = `${baseURL}/electron/turnOver/task/${payload.taskId}/${payload.userId}`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return resp.data || resp;
  }

  /**
   * 接收任务
   */
  public async receiveElectronTask(payload: { taskId: string }): Promise<unknown> {
    const url = `${baseURL}/electron/accept/task/${payload.taskId}`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return resp.data || resp;
  }

  /**
   * 获取巡更任务详情
   */
  public async getElectronTaskDetail(payload: { taskId: string }): Promise<ElectronTaskDetailVo> {
    const url = `${baseURL}/electron/task/${payload.taskId}`;
    const resp = await this.gateway.get<ElectronTaskDetailVo>({ url });
    return resp;
  }

  /**
   * 获取指定时间段的巡更点位
   */
  public async getElectronTaskPoint(payload: {
    taskId: string;
    executePeriod?: string;
    areaSequence?: string;
    resultNull?: boolean;
  }): Promise<PatrolPointVo[]> {
    const url = `${baseURL}/electron/task/location`;
    const resp = await this.gateway.get<PatrolPointVo[]>({ url, payload });
    return resp;
  }

  /**
   * 判断任务是否可以巡更
   */
  public async checkCanElectronTask(payload: { taskId: string }): Promise<boolean> {
    const url = `${baseURL}/electron/task/taskOverdue/${payload.taskId}`;
    const resp = await this.gateway.get<boolean>({ url });
    return resp;
  }

  /**
   * 巡更统计
   */
  public async getElectronTaskStat(payload: { period: string; type: string }): Promise<ElectronPatrolStat> {
    const url = `${baseURL}/electron/task/home-page/stat`;
    const resp = await this.gateway.get<ElectronPatrolStat>({ url, payload });
    return resp;
  }

  /**
   * 提交巡更结果
   */
  public async submitElectronTaskResult(payload: {
    id: string;
    result: string;
    remark: string;
    fileIds: string[];
    hiddenId: string;
    isToHidden: boolean;
  }): Promise<unknown> {
    const url = `${baseURL}/electron/task/submitResult`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /**
   * 获取蓝牙设备下所有的巡更点位
   */
  public async getElectronTaskPointsByBluetooth(payload: { bluetoothCodes: string[] }): Promise<PatrolPointVo[]> {
    const url = `${baseURL}/electron/task/getAllLocation`;
    const resp = await this.gateway.create<PatrolPointVo[]>({ url, payload });
    return resp;
  }

  /**
   * 获取NFC设备下所有的巡更点位
   */
  public async getElectronTaskPointsByNfc(payload: { nfcCode: string }): Promise<PatrolPointVo> {
    const url = `${baseURL}/electron/task/getLocationRecordBy/${payload.nfcCode}`;
    const resp = await this.gateway.get<PatrolPointVo>({ url });
    return resp;
  }

  /**
   * GPS巡更匹配
   */
  public async matchGpsPatrol(payload: GpsPatrolMatchRequest): Promise<GpsPatrolMatchResponse> {
    const url = `${baseURL}/electron/task/gps/match`;
    const resp = await this.gateway.create<GpsPatrolMatchResponse>({ url, payload });
    return resp;
  }

  /**
   * 获取当前点位id的巡更任务
   */
  public async getElectronTaskByLocationId(payload: { locationId: string }): Promise<PatrolPointVo> {
    const url = `${baseURL}/electron/task/getLocationRecord/${payload.locationId}`;
    const resp = await this.gateway.get<PatrolPointVo>({ url });
    return resp;
  }

  /**
   * 巡更点-缺失经纬度时更新经纬度
   */
  public async updatePatrolLocationLatAndLonIfAbsent(payload: PatrolLocationLatAndLonUpdatePayload): Promise<void> {
    const url = `${baseURL}/patrol/location/updateLatAndLonIfAbsent`;
    await this.gateway.update<LegacyServiceError<void>>({ url, payload });
  }

  /**
   * 获取巡更点下的区域
   */
  public async getLocationArea(payload: { taskId: string }): Promise<AreaType[]> {
    const url = `${baseURL}/electron/task/location-area`;
    const resp = await this.gateway.get<AreaType[]>({ url, payload });
    return resp;
  }

  /**
   * 获取巡更点下的区域
   */
  public async locationDistribution(payload: { taskId: string; userId: string; locationIds: string[] }): Promise<boolean> {
    const url = `${baseURL}/electron/task/location-distribution`;
    const resp = await this.gateway.create<boolean>({ url, payload });
    return resp;
  }
}
