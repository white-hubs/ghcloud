import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import {
  DroneControlPayload,
  AlarmLevelModel,
  AlarmTypeModel,
  AlarmDetailModel,
  DevicePageModel,
  DroneAlarmDispatchConfigModel,
  DroneAlarmDispatchRecordModel,
  DroneDetailModel,
  DroneRouteCommand,
  DroneRouteListModel,
  DroneRouteModel,
  DroneRoutePagePayload,
  DroneRouteStatusPayload,
  FlightTaskListModel,
  NestDetailModel,
  PageResult,
  SecurityDevicePagePayload,
  SecurityDeviceRecord,
  ShouterTransferPayload,
  TaskAchievementListModel,
  TaskLogDetailModel,
  TrackDetailModel,
  TrackListModel,
  VideoStreamPayload,
} from "./types";

const baseURL = `${BASE_API}/changsha-xialing`;
const maintainBaseURL = `${BASE_API}/maintain`;

/** 无人机接口 */
export class CubeDroneService {
  private readonly gateway: CubeGateway;
  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 分页查询航迹列表 */
  public async getTrackListPage(payload: {
    pageSize: number;
    pageNumber: number;
    trackName?: string | undefined;
    nestSn?: string | undefined;
    types?: number[];
  }): Promise<PageResult<TrackListModel>> {
    const url = `${baseURL}/drone/routes/page`;
    const resp = await this.gateway.create<PageResult<TrackListModel>>({ url, payload });
    return resp;
  }

  /** 分页查询系统内无人机航线配置 */
  public async getDroneRoutePage(payload: DroneRoutePagePayload): Promise<PageResult<DroneRouteListModel>> {
    const url = `${maintainBaseURL}/inspect/drone/routes/page`;
    const resp = await this.gateway.get<PageResult<DroneRouteListModel>>({ url, payload });
    return resp;
  }

  /** 分页查询当前应用关联的设备台账 */
  public async getSecurityDevicePage(payload: SecurityDevicePagePayload): Promise<PageResult<SecurityDeviceRecord>> {
    const url = `${BASE_API}/securitymanagement/getSecurityDevicePage/${payload.applicationCode}`;
    const resp = await this.gateway.get<PageResult<SecurityDeviceRecord> | { data: PageResult<SecurityDeviceRecord> }>({
      url,
      payload,
    });
    return ((resp as { data?: PageResult<SecurityDeviceRecord> }).data || resp) as PageResult<SecurityDeviceRecord>;
  }

  /** 查询系统内无人机航线详情，包含航点行 */
  public async getDroneRoute(id: number | string): Promise<DroneRouteModel> {
    const url = `${maintainBaseURL}/inspect/drone/routes/${id}`;
    const resp = await this.gateway.get<DroneRouteModel>({ url });
    return resp;
  }

  /** 创建系统内无人机航线头信息与航点行 */
  public async createDroneRoute(payload: DroneRouteCommand): Promise<number> {
    const url = `${maintainBaseURL}/inspect/drone/routes`;
    const resp = await this.gateway.create<number>({ url, payload });
    return resp;
  }

  /** 修改系统内无人机航线头信息与航点行 */
  public async updateDroneRoute(id: number | string, payload: DroneRouteCommand): Promise<void> {
    const url = `${maintainBaseURL}/inspect/drone/routes/${id}`;
    await this.gateway.update<void>({ url, payload });
  }

  /** 启用或禁用系统内无人机航线 */
  public async changeDroneRouteStatus(id: number | string, payload: DroneRouteStatusPayload): Promise<void> {
    const url = `${maintainBaseURL}/inspect/drone/routes/${id}/status`;
    await this.gateway.update<void>({ url, payload });
  }

  /** 删除系统内无人机航线 */
  public async deleteDroneRoute(id: number | string): Promise<void> {
    const url = `${maintainBaseURL}/inspect/drone/routes/${id}`;
    await this.gateway.delete({ url });
  }

  /**
   * 分页查询任务列表
   * 接口：POST /drone/tasks/page
   * 返回：
   * - total: 总条数
   * - pages: 总页数
   * - records: 任务列表，字段见 FlightTaskListModel
   */
  public async getFlightTaskListPage(payload: {
    pageNumber: number;
    pageSize: number;
    type?: number | undefined;
    nestSn?: string | undefined;
    trackId?: number | undefined;
    taskName?: string | undefined;
  }): Promise<PageResult<FlightTaskListModel>> {
    const url = `${baseURL}/drone/tasks/page`;
    const resp = await this.gateway.create<PageResult<FlightTaskListModel>>({ url, payload });
    return resp;
  }

  /** 分页查询任务成果列表 */
  public async getTaskAchievementListPage(payload: {
    pageNumber: number;
    pageSize: number;
    taskName?: string | undefined;
    fileType?: number | undefined;
    channelType?: number | undefined;
    scheduledId?: number | undefined;
    pType?: number | undefined;
  }): Promise<PageResult<TaskAchievementListModel>> {
    const url = `${baseURL}/drone/results/page`;
    const resp = await this.gateway.create<PageResult<TaskAchievementListModel>>({ url, payload });
    return resp;
  }

  /** 下载任务成果文件 */
  public async downloadTaskAchievement(fileKey: string): Promise<Blob> {
    const url = `${baseURL}/drone/results/download`;
    const resp = await this.gateway.customBlob({ url, method: "GET", query: { fileKey } });
    return resp;
  }

  /** 查询机巢状态 */
  public async getNestDetail(nestSn: string): Promise<NestDetailModel> {
    const url = `${baseURL}/nest/getDetail/${nestSn}`;
    const resp = await this.gateway.get<NestDetailModel>({ url });
    return resp;
  }

  /** 查询飞机实时状态 */
  public async getDroneDetail(droneSn: string): Promise<DroneDetailModel> {
    const url = `${baseURL}/drone/getDetail/${droneSn}`;
    const resp = await this.gateway.get<DroneDetailModel>({ url });
    return resp;
  }

  /** 查询机巢绑定飞机实时状态 */
  public async getDroneDetailByNest(nestSn: string): Promise<DroneDetailModel> {
    const url = `${baseURL}/drone/getDetailByNest/${nestSn}`;
    const resp = await this.gateway.get<DroneDetailModel>({ url });
    return resp;
  }

  /** 查询飞行轨迹详情 */
  public async getTrackDetail(taskLogId: string): Promise<TrackDetailModel> {
    const url = `${baseURL}/track/getOne/${taskLogId}`;
    const resp = await this.gateway.get<TrackDetailModel>({ url });
    return resp;
  }

  /** 查询任务日志详情 */
  public async getTaskLogDetail(taskLogId: string): Promise<TaskLogDetailModel> {
    const url = `${baseURL}/taskLog/getOne/${taskLogId}`;
    const resp = await this.gateway.get<TaskLogDetailModel>({ url });
    return resp;
  }

  /** 申请设备控制权限 */
  public async applyControl(deviceType: "Nest" | "Drone" | "Load", sn: string): Promise<unknown> {
    const url = `${baseURL}/system/control/apply${deviceType}`;
    const resp = await this.gateway.get<unknown>({ url, payload: { sn } });
    return resp;
  }

  /** 释放设备控制权限 */
  public async releaseControl(sn: string, deviceType: "NEST" | "DRONE" | "LOAD"): Promise<unknown> {
    const url = `${baseURL}/system/control/release`;
    const resp = await this.gateway.get<unknown>({ url, payload: { sn, deviceType } });
    return resp;
  }

  /** 飞行方向控制 */
  public async flyAction(sn: string, type: number): Promise<unknown> {
    const url = `${baseURL}/nest/cmd/flyAction/${sn}/${type}`;
    const resp = await this.gateway.get<unknown>({ url });
    return resp;
  }

  /** 悬停 */
  public async hover(sn: string): Promise<unknown> {
    const url = `${baseURL}/drone/cmd/boot/hover/${sn}`;
    const resp = await this.gateway.get<unknown>({ url });
    return resp;
  }

  /** 精准返航 */
  public async precisionReturn(nestSn: string): Promise<unknown> {
    const url = `${baseURL}/drone/cmd/boot/precision/${nestSn}`;
    const resp = await this.gateway.get<unknown>({ url });
    return resp;
  }

  /** 指点飞行 */
  public async giveDirectionsFlight(payload: DroneControlPayload): Promise<unknown> {
    const url = `${baseURL}/drone/cmd/boot/giveDirectionsMore/flight`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }

  /** 云台/相机控制 */
  public async cameraControl(nestSn: string, ytType: number, type: string, category: number): Promise<unknown> {
    const url = `${baseURL}/drone/cmd/camera/${nestSn}/${ytType}/${type}/${category}`;
    const resp = await this.gateway.get<unknown>({ url });
    return resp;
  }

  /** 相机模式切换 */
  public async setCameraModel(nestSn: string, cmdid: number, modle: number): Promise<unknown> {
    const url = `${baseURL}/drone/cmd/boot/camera/model/set/${nestSn}/${cmdid}/${modle}`;
    const resp = await this.gateway.get<unknown>({ url });
    return resp;
  }

  /** 变倍控制 */
  public async cloudZoom(nestSn: string, comId: number, model: number, value: number): Promise<unknown> {
    const url = `${baseURL}/drone/cmd/cloudZoom/${nestSn}/${comId}/${model}/${value}`;
    const resp = await this.gateway.get<unknown>({ url });
    return resp;
  }

  /** 机巢舱门控制 */
  public async hatchControl(nestSn: string, type: "open" | "close"): Promise<unknown> {
    const url = `${baseURL}/nest/cmd/hatch/${nestSn}/${type}`;
    const resp = await this.gateway.get<unknown>({ url });
    return resp;
  }

  /** 机巢充电控制 */
  public async chargeControl(nestSn: string, type: "start" | "stop"): Promise<unknown> {
    const url = `${baseURL}/nest/cmd/charge/${nestSn}/${type}`;
    const resp = await this.gateway.get<unknown>({ url });
    return resp;
  }

  /** 机巢归中控制 */
  public async putterControl(nestSn: string, type: "withdraw" | "rellout"): Promise<unknown> {
    const url = `${baseURL}/nest/cmd/putter/${nestSn}/${type}`;
    const resp = await this.gateway.get<unknown>({ url });
    return resp;
  }

  /** 喊话器属性设置 */
  public async setShouterProperty(payload: Record<string, unknown>): Promise<unknown> {
    const url = `${baseURL}/drone/cmd/shouter/set/property`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }

  /** 喊话器文本传输 */
  public async transferShouterText(payload: ShouterTransferPayload): Promise<unknown> {
    const url = `${baseURL}/drone/cmd/shouter/set/transfer`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }

  /** 获取视频流记录 */
  public async getMp4RecordFile(payload: VideoStreamPayload): Promise<unknown> {
    const url = `${baseURL}/index/api/getMp4RecordFile`;
    const resp = await this.gateway.get<unknown>({ url, payload });
    return resp;
  }
}
