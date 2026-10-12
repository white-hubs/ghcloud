import { type CubeAuth } from "@ghcloud/cube-gateway";
import { DroneControlPayload, DroneDetailModel, DroneRouteCommand, DroneRouteListModel, DroneRouteModel, DroneRoutePagePayload, DroneRouteStatusPayload, FlightTaskListModel, NestDetailModel, PageResult, SecurityDevicePagePayload, SecurityDeviceRecord, ShouterTransferPayload, TaskAchievementListModel, TaskLogDetailModel, TrackDetailModel, TrackListModel, VideoStreamPayload } from "./types";
/** 无人机接口 */
export declare class CubeDroneService {
    private readonly gateway;
    constructor(auth: CubeAuth);
    /** 分页查询航迹列表 */
    getTrackListPage(payload: {
        pageSize: number;
        pageNumber: number;
        trackName?: string | undefined;
        nestSn?: string | undefined;
        types?: number[];
    }): Promise<PageResult<TrackListModel>>;
    /** 分页查询系统内无人机航线配置 */
    getDroneRoutePage(payload: DroneRoutePagePayload): Promise<PageResult<DroneRouteListModel>>;
    /** 分页查询当前应用关联的设备台账 */
    getSecurityDevicePage(payload: SecurityDevicePagePayload): Promise<PageResult<SecurityDeviceRecord>>;
    /** 查询系统内无人机航线详情，包含航点行 */
    getDroneRoute(id: number | string): Promise<DroneRouteModel>;
    /** 创建系统内无人机航线头信息与航点行 */
    createDroneRoute(payload: DroneRouteCommand): Promise<number>;
    /** 修改系统内无人机航线头信息与航点行 */
    updateDroneRoute(id: number | string, payload: DroneRouteCommand): Promise<void>;
    /** 启用或禁用系统内无人机航线 */
    changeDroneRouteStatus(id: number | string, payload: DroneRouteStatusPayload): Promise<void>;
    /** 删除系统内无人机航线 */
    deleteDroneRoute(id: number | string): Promise<void>;
    /**
     * 分页查询任务列表
     * 接口：POST /drone/tasks/page
     * 返回：
     * - total: 总条数
     * - pages: 总页数
     * - records: 任务列表，字段见 FlightTaskListModel
     */
    getFlightTaskListPage(payload: {
        pageNumber: number;
        pageSize: number;
        type?: number | undefined;
        nestSn?: string | undefined;
        trackId?: number | undefined;
        taskName?: string | undefined;
    }): Promise<PageResult<FlightTaskListModel>>;
    /** 分页查询任务成果列表 */
    getTaskAchievementListPage(payload: {
        pageNumber: number;
        pageSize: number;
        taskName?: string | undefined;
        fileType?: number | undefined;
        channelType?: number | undefined;
        scheduledId?: number | undefined;
        pType?: number | undefined;
    }): Promise<PageResult<TaskAchievementListModel>>;
    /** 下载任务成果文件 */
    downloadTaskAchievement(fileKey: string): Promise<Blob>;
    /** 查询机巢状态 */
    getNestDetail(nestSn: string): Promise<NestDetailModel>;
    /** 查询飞机实时状态 */
    getDroneDetail(droneSn: string): Promise<DroneDetailModel>;
    /** 查询机巢绑定飞机实时状态 */
    getDroneDetailByNest(nestSn: string): Promise<DroneDetailModel>;
    /** 查询飞行轨迹详情 */
    getTrackDetail(taskLogId: string): Promise<TrackDetailModel>;
    /** 查询任务日志详情 */
    getTaskLogDetail(taskLogId: string): Promise<TaskLogDetailModel>;
    /** 申请设备控制权限 */
    applyControl(deviceType: "Nest" | "Drone" | "Load", sn: string): Promise<unknown>;
    /** 释放设备控制权限 */
    releaseControl(sn: string, deviceType: "NEST" | "DRONE" | "LOAD"): Promise<unknown>;
    /** 飞行方向控制 */
    flyAction(sn: string, type: number): Promise<unknown>;
    /** 悬停 */
    hover(sn: string): Promise<unknown>;
    /** 精准返航 */
    precisionReturn(nestSn: string): Promise<unknown>;
    /** 指点飞行 */
    giveDirectionsFlight(payload: DroneControlPayload): Promise<unknown>;
    /** 云台/相机控制 */
    cameraControl(nestSn: string, ytType: number, type: string, category: number): Promise<unknown>;
    /** 相机模式切换 */
    setCameraModel(nestSn: string, cmdid: number, modle: number): Promise<unknown>;
    /** 变倍控制 */
    cloudZoom(nestSn: string, comId: number, model: number, value: number): Promise<unknown>;
    /** 机巢舱门控制 */
    hatchControl(nestSn: string, type: "open" | "close"): Promise<unknown>;
    /** 机巢充电控制 */
    chargeControl(nestSn: string, type: "start" | "stop"): Promise<unknown>;
    /** 机巢归中控制 */
    putterControl(nestSn: string, type: "withdraw" | "rellout"): Promise<unknown>;
    /** 喊话器属性设置 */
    setShouterProperty(payload: Record<string, unknown>): Promise<unknown>;
    /** 喊话器文本传输 */
    transferShouterText(payload: ShouterTransferPayload): Promise<unknown>;
    /** 获取视频流记录 */
    getMp4RecordFile(payload: VideoStreamPayload): Promise<unknown>;
}
