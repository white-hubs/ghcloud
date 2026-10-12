import type { MediaState, LinkageDevice, LinkageExecuteRecord, AlarmEventRecord } from "./type";
import { type CubeAuth, CubeGateway, type LegacyServiceError, Pagination } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";
const baseURL = `${BASE_API}/linkage`;
export class CubeLinkageService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 根据事件获取摄像机动作执行附件列表 */
  public async getEventVideoImages(payload: { eventId: string }): Promise<MediaState[]> {
    const url = `${baseURL}/event-video-file-paths/${payload.eventId}`;
    const resp = await this.gateway.get<LegacyServiceError<MediaState[]>>({
      url,
    });
    return resp.data || resp;
  }

  /** 获取媒体鉴权 */
  public async getMediasSession(): Promise<{ session: string; expireTimes: number }> {
    const url = "/api/mdata/video-ptz/login-session";
    const resp = await this.gateway.get<LegacyServiceError<{ session: string; expireTimes: number }>>({
      url,
    });
    return resp.data || resp;
  }

  /** 根据事件获取联动设备  */
  public async getLinkageDevicesAction(payload: { eventId: string }): Promise<LinkageDevice[]> {
    const url = `${baseURL}/event-iot-device-pros/${payload.eventId}`;
    const resp = await this.gateway.get<LegacyServiceError<LinkageDevice[]>>({
      url,
    });
    return resp.data || resp;
  }

  /** 根据事件获取物联设备执行记录  */
  public async getLinkageDeviceRecords(payload: { eventId: string }): Promise<LinkageExecuteRecord[]> {
    const url = `${baseURL}/event-iot-device-pro-records/${payload.eventId}`;
    const resp = await this.gateway.get<LegacyServiceError<LinkageExecuteRecord[]>>({
      url,
    });
    return resp.data || resp;
  }

  // 执行指令
  public async updateExecuteOrder(payload: { eventIotDeviceId: string }): Promise<void> {
    const url = `${baseURL}/event-iot-device-pro/ctrl`;
    await this.gateway.update({ url, payload });
  }

  // 一键执行联动
  public async oneKeyExecuteOrder(eventId: string): Promise<void> {
    const url = `${baseURL}/event/${eventId}/iot-device-pro/hand/ctrl`;
    await this.gateway.create({ url });
  }
}
