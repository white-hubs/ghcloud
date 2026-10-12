import type { CubeAuth } from "@ghcloud/cube-identity-service";

import { cubeAppBridge, type CubeAppBridge } from "./bridge/cube-app-bridge";
declare global {
  interface Window {
    __CUBE_AUTH_INFO__?: CubeAuth;
  }
}
interface OSSFile {
  businessKey: string;
  id: string;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  type: string;
}

export interface CubeAppLocation {
  latitude?: number;
  longitude?: number;
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  street?: string;
  address?: string;
}

export enum CubeAppPageOrientationEnum {
  // 竖屏
  PORTRAIT = "portrait",
  // 横屏
  LANDSCAPE = "landscape",
}

export enum RefreshNativeBusiness {
  /** 流程表单 */
  FLOW_PROCESS = "FLOW_PROCESS",
  /** 通知公告 */
  NOTICE = "NOTICE",
  /** 能耗 */
  ENERGY = "ENERGY",
  /** 报警 */
  ALARM = "ALARM",
  /** 维保 */
  MAINTENANCE = "MAINTENANCE",
  /** 日常巡检 */
  PATROL_INSPECT = "PATROL_INSPECT",
  /** 刷新日常巡检离线数据 */
  PATROL_INSPECT_REFRESH_OFFLINE_DATA = "PATROL_INSPECT_REFRESH_OFFLINE_DATA",
  /** 电子巡更 */
  ELECTRONIC_PATROL = "ELECTRONIC_PATROL",
}

export class CubeAppService {
  private static readonly cubeAppService = new CubeAppService(cubeAppBridge);
  public static getInstance(): CubeAppService {
    return this.cubeAppService;
  }

  private constructor(private readonly cubeAppBridge: CubeAppBridge) {}

  public async getUser(): Promise<{ id: string; name: string }> {
    return this.cubeAppBridge.call<{ id: string; name: string }>("getUserInfo", {});
  }

  public async getRequestHeader(): Promise<{
    Authorization: string;
    tenant: string;
    terminal: string;
  }> {
    if (window.__CUBE_AUTH_INFO__) {
      return {
        Authorization: "bearer " + window.__CUBE_AUTH_INFO__.token,
        tenant: window.__CUBE_AUTH_INFO__.tenant,
        terminal: window.__CUBE_AUTH_INFO__.terminal,
      };
    }
    return this.cubeAppBridge.call<{
      Authorization: string;
      tenant: string;
      terminal: string;
    }>("getRequestHeader", {});
  }

  public async closePage(params?: unknown): Promise<void> {
    await this.cubeAppBridge.call("closePage", params ?? "");
  }

  public async backPage(params?: unknown): Promise<void> {
    await this.cubeAppBridge.call("backPage", params ?? "");
  }

  public async onVisibilityNativeAppBar(params?: boolean): Promise<void> {
    await this.cubeAppBridge.call("onVisibilityNativeAppBar", params?.toString() ?? "true");
  }

  public async toFlowProcessRecordPage(): Promise<void> {
    await this.cubeAppBridge.call("toFlowProcessRecordPage", {});
  }

  public async toFlowProcessHandleEventPage(event: string, formData: Record<string, unknown>): Promise<void> {
    await this.cubeAppBridge.call("toFlowProcessHandleEventPage", { type: event, formData });
  }

  public async requestStoragePermission(): Promise<unknown> {
    return this.cubeAppBridge.call<unknown>("requestStoragePermission", {});
  }

  /**
  * 上传文件
  * @param maxCount 最大上传数量
  * @param expandField 扩展字段 {
  *   watermarkTypes?: string[]; 水印类型 (字典获取)
  *     `custom`（自定义）、`location`（地址）、`timestamp`（时间）
  *   customWaterMark?: string; 自定义水印字符
  *   uploadMethod?: string[]; 上传方式用(字典获取)
  *     `camera`（相机拍照）、`album`（相册图片）、`file`（文件）
  *   sceneCode: string; 场景编码 每个业务桶唯一 后端定义
  }
  * @returns
  */
  public async uploadImage(
    maxCount: string,
    expandField?: {
      sceneCode?: string;
      watermarkTypes?: string[];
      customWaterMark?: string;
      uploadMethod?: string[];
    },
  ): Promise<OSSFile[]> {
    const params = expandField ? { maxCount, ...expandField } : { maxCount };
    return this.cubeAppBridge.call("uploadImage", JSON.stringify(params));
  }

  // 唤起app签名
  public async uploadSignature(): Promise<unknown> {
    return this.cubeAppBridge.call<unknown>("uploadSignature", {});
  }

  /** 打开文件 */
  public async openFile(url: string): Promise<unknown> {
    return this.cubeAppBridge.call<unknown>("openFile", url);
  }

  /** 上传文件 */
  public async uploadFile(
    uploadNum: string,
    expandField?: {
      sceneCode?: string;
    },
  ): Promise<OSSFile[]> {
    const params = expandField ? { uploadNum, ...expandField } : { uploadNum };
    return this.cubeAppBridge.call("uploadFile", JSON.stringify(params));
  }

  /**
   * 拍照
   * @param sceneCode 场景编码 每个业务桶唯一 后端定义
   * @param retakeText 重新拍照按钮文字，默认“重拍”
   * @param confirmText 确认拍照按钮文字，默认“确认”
   * @param watermarkTypes 水印类型(自定义：custom 地址：location 时间：timestamp)
   * @param customWaterMark 自定义水印字符 watermarkTypes 包含 custom
   * @returns Promise<OSSFile> 拍照后上传服务端后返回结果
   */
  public async takePhoto(params: {
    sceneCode: string;
    retakeText?: string;
    confirmText?: string;
    watermarkTypes?: string[];
    customWaterMark?: string;
  }): Promise<OSSFile | null> {
    return this.cubeAppBridge.call("takePhoto", JSON.stringify(params));
  }

  /**
   * 相册
   * @param sceneCode 场景编码 每个业务桶唯一 后端定义
   * @param maxCount 最大上传数量，默认“1”
   * @param watermarkTypes 水印类型(自定义：custom 地址：location 时间：timestamp)
   * @param customWaterMark 自定义水印字符
   * @returns Promise<OSSFile> 拍照后上传服务端后返回结果
   */
  public async pickPhoto(params: {
    sceneCode: string;
    maxCount?: number;
    watermarkTypes?: string[];
    customWaterMark?: string;
  }): Promise<OSSFile[] | null> {
    return this.cubeAppBridge.call("pickPhoto", JSON.stringify(params));
  }

  /** 下载文件 */
  public async downloadFile(params: { filePath: string; fileName: string }): Promise<unknown> {
    return this.cubeAppBridge.call("downloadFile", JSON.stringify(params));
  }

  public async onQrcodeReceived(code: string): Promise<unknown[]> {
    return this.cubeAppBridge.call("onQrcodeReceived", code);
  }

  public async openQrcodeBusiness(params: string): Promise<unknown[]> {
    return this.cubeAppBridge.call("openQrcodeBusiness", params);
  }

  public async openBusinessStatsRecord(params: string): Promise<unknown[]> {
    return this.cubeAppBridge.call("openBusinessStatsRecord", params);
  }

  public async openObjectDetails(params?: string): Promise<unknown[]> {
    return this.cubeAppBridge.call("openObjectDetails", params);
  }

  /** 扫码，`scannerShowAlbum` 不传时默认为 `false` */
  public async onScanCode(scannerShowAlbum?: boolean): Promise<string> {
    return this.cubeAppBridge.call("onScanCode", scannerShowAlbum?.toString() ?? "false");
  }

  /** 获取APP缓存的业务数据 */
  public async getBusinessData(): Promise<Record<string, unknown>> {
    return this.cubeAppBridge.call("getBusinessData", {});
  }

  // 获取主题色
  public async getAppTheme(): Promise<string> {
    return this.cubeAppBridge.call("getAppTheme", {});
  }

  /**
   * 设置屏幕方向
   */
  public async setPageOrientation(type: CubeAppPageOrientationEnum): Promise<Record<string, unknown>> {
    return this.cubeAppBridge.call("setPageOrientation", type);
  }

  /** 再次发起流程申请 */
  public async flowProcessReapply(jsonString: string): Promise<void> {
    await this.cubeAppBridge.call("flowProcessReapply", jsonString);
  }

  /** 通知原生刷新内容 */
  public async refreshNativeData(value: RefreshNativeBusiness): Promise<void> {
    await this.cubeAppBridge.call("refreshNativeData", value);
  }

  /** 总部报警记录 */
  public async toSafetyAlarmRecordPage(jsonString: string): Promise<void> {
    await this.cubeAppBridge.call("toSafetyAlarmRecordPage", jsonString);
  }

  /** 总部小散工程记录 */
  public async toSafetyEngineeringRecordPage(jsonString: string): Promise<void> {
    await this.cubeAppBridge.call("toSafetyEngineeringRecordPage", jsonString);
  }

  /** 预案文件跳转 */
  public async toSafetyPlanFilePage(jsonString: string): Promise<void> {
    await this.cubeAppBridge.call("toSafetyEmergencyFilePage", jsonString);
  }

  /** 跳转隐患排查 */
  public async toSafetyHiddenDangerRecordPage(jsonString: string): Promise<void> {
    await this.cubeAppBridge.call("toSafetyHiddenDangerRecordPage", jsonString);
  }

  /** 跳转设备台账 */
  public async toSafetyDevicePage(jsonString: string): Promise<void> {
    await this.cubeAppBridge.call("toSafetyDevicePage", jsonString);
  }

  /** 市场跳转设备列表 */
  public async toMonitorDevicePage(jsonString: string): Promise<void> {
    await this.cubeAppBridge.call("toMonitorDevicePage", jsonString);
  }

  /** 市场跳转预案文件 */
  public async toEmergencyFilePage(jsonString?: string): Promise<void> {
    await this.cubeAppBridge.call("toEmergencyFilePage", jsonString);
  }

  /** 市场跳转小散工程 */
  public async toSmallEngineeringRecordPage(jsonString: string): Promise<void> {
    await this.cubeAppBridge.call("toSmallEngineeringRecordPage", jsonString);
  }

  /** 市场跳转历史流程表单 */
  public async toFlowProcessHistoryRecordPage(jsonString: string): Promise<void> {
    await this.cubeAppBridge.call("toFlowProcessHistoryRecordPage", jsonString);
  }

  /**
   *
   * @param config 打开地图
   * @param config.type 地图类型
   * @param config.address 地址
   * @param config.longitude 经度
   * @param config.latitude 纬度
   */
  public async openTripartiteMap(config: {
    type: "route" | "marker";
    address: string;
    longitude: number;
    latitude: number;
  }): Promise<void> {
    if (Object.prototype.toString.call(config) !== "[object Object]") {
      throw new Error("config is not object");
    }
    const jsonString = JSON.stringify(config);
    await this.cubeAppBridge.call("openTripartiteMap", jsonString);
  }

  /**
   * 待办中心进业务详情
   * @param config
   * @param config.applicationCode 应用编码
   * @param config.businessType 业务类型
   * @param config.businessKey 业务key
   * @returns Promise<string|null> // json字符串对象或者null 如为json字符串对象即为跳转h5页面的路由地址 前端跳转 null app处理
   */
  public async openBusinessDetailsPage(config: {
    applicationCode: string;
    businessType: string;
    businessKey: string;
  }): Promise<string | null> {
    if (Object.prototype.toString.call(config) !== "[object Object]") {
      throw new Error("config is not object");
    }
    const jsonString = JSON.stringify(config);
    return this.cubeAppBridge.call("openBusinessDetailsPage", jsonString);
  }

  /**
   * 打开蓝牙扫描
   * @returns Promise<string|null>
   */
  public async onScanBluetooth(): Promise<string[] | null> {
    return this.cubeAppBridge.call("onScanBluetooth", {});
  }

  /**
   * 打开NFC扫描
   *  @returns Promise<string|null>
   */
  public async onScanNFC(): Promise<string | null> {
    return this.cubeAppBridge.call("onScanNFC", {});
  }

  /**
   * 拨打电话
   */
  public async callPhone(phoneNumber: string): Promise<void> {
    return this.cubeAppBridge.call("callPhone", phoneNumber);
  }

  /**
   * 播放视频/设备监控视频
   * 支持mp4 rtsp hls flv等格式
   * @param config
   * @param config.videoUrl 视频url
   * @param config.videoName 视频名称
   */
  public async playVideo(config: { videoUrl: string; videoName?: string }): Promise<void> {
    if (Object.prototype.toString.call(config) !== "[object Object]") {
      throw new Error("config is not object");
    }
    const jsonString = JSON.stringify(config);
    return this.cubeAppBridge.call("playVideo", jsonString);
  }

  /**
   * 播放设备监控视频
   * @param config
   * @param config.deviceId 设备id
   * @param config.deviceName 设备名称
   * @param config.deviceToken 设备token
   */
  public async playDeviceMonitor(config: { deviceId: string; deviceToken: string; deviceName?: string }): Promise<void> {
    if (Object.prototype.toString.call(config) !== "[object Object]") {
      throw new Error("config is not object");
    }
    const jsonString = JSON.stringify(config);
    return this.cubeAppBridge.call("playDeviceMonitor", jsonString);
  }

  /**
   * 获取原生端提供的当前位置信息。
   *
   * 仅在 cube-app 环境可用，对应原生桥接方法 `getLocation`。原生端会优先尝试获取当前位置，
   * 失败时兜底读取最后已知位置；若定位权限、系统定位服务、逆地理编码等任一环节不可用，
   * 可能返回 `null`，业务侧需要自行处理无位置结果。
   *
   * @returns 位置信息。`latitude`/`longitude` 为原生定位返回的经纬度；地址字段来自原生逆地理编码结果。
   */
  public async getLocation(): Promise<CubeAppLocation | null> {
    return this.cubeAppBridge.call<CubeAppLocation | null>("getLocation", {});
  }
}
export const cubeAppServiceInstance = CubeAppService.getInstance();
