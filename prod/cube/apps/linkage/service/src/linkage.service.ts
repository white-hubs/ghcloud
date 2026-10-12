import { type CubeAuth, CubeGateway, type LegacyServiceError, Pagination } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

const baseURL = `${BASE_API}`;

export interface EventVideo {
  /**
   * 设备编号
   */
  deviceCode: string;
  /**
   * 设备主键
   */
  deviceId: number;
  /**
   * 设备名称
   */
  deviceName: string;
  /**
   * 持续次数
   */
  durationTime: number;
  /**
   * 事件主键
   */
  eventId: number;
  /**
   * 事件关联预案主键
   */
  eventLinkageId: number;
  /**
   * 执行方式
   */
  executeMode: "AUTOMATIC" | "MANUAL";
  id: string;
  /**
   * 间隔时间
   */
  intervalTime: number;
  /**
   * 联动预案主键
   */
  linkageId: number;
  /**
   * 动作时长
   */
  time: number;
  /**
   * 动作时长单位
   */
  timeUnit: string;
  /**
   * 摄像机token
   */
  token: string;
  /**
   * 动作类型
   */
  type: "PHOTOGRAPH" | "VIDEOTAPE";
}
export interface GetAlarmRecordDetail {
  id: string;
  code: string;
  alarmLevelId: string;
  alarmLevelCode: string;
  alarmLevelName: string;
  alarmLevelSort: number;
  alarmTypeId: string;
  alarmTypeCode: string;
  alarmTypeName: string;
  alarmTypeFileId?: string;
  alarmTargetKey: string;
  alarmTargetCode: string;
  alarmTargetName: string;
  alarmTargetTypeId: string;
  alarmTargetTypeName: string;
  alarmTargetLongitude: string;
  alarmTargetAddress: string;
  businessType: string;
  businessKey: string;
  alarmTime: number;
  area: string;
  areaName: string;
  alarmThreshold: string;
  alarmEvent: string;
  alarmEventName: string;
  alarmStatus: string;
  alarmStatusName: string;
  alarmConfirmedBy?: string;
  alarmConfirmedName: string;
  alarmConfirmedTime?: string;
  estimateHandlerTime?: string;
  alarmHandlerBy: string;
  alarmHandlerName: string;
  alarmHandlerTime?: string;
  alarmHandlerResult?: string;
  alarmNotifyUsername: string;
  alarmHandlerResultName: string;
  alarmHandlerResultRemark: string;
  timeoutProcessTime: number;
  timeoutProcessTimes: number;
  timeoutProcessTimesUnit: string;
  timeoutProcessTimesName: string;
  alarmHandlerTimeoutStatus: string;
  alarmHandlerTimeoutStatusName: string;
  applicationId?: string;
  applicationCode: string;
  applicationName: string;
  snapshot: string;
  alarmSnapshot: string;
  businessSnapshot: string;
  fileVO?: string;
  handlerFileVOS: string[];
  url: string;
  suspend?: string;
  handler?: string;
  processingTime: number;
  alarmOperator: string[];
}

export interface AlarmEventRecord {
  id: string;
  code: string;
  name: string;
  eventId: string;
  eventTime: string;
  eventDevice: {
    id: string;
    code: string;
    name: string;
    areaName: string;
    lntAndLat: string;
    address: string;
  };
  eventLevel: {
    id: string;
    code: string;
    name: string;
  };
  eventSnapshot: {
    snapshot: string;
  };
  eventApp: {
    code: string;
    name: string;
  };
  eventType: {
    id: string;
    code: string;
    name: string;
  };
  assistConfirmResult: {
    result: string;
  };
}
export interface MediaState {
  id: string;
  eventVideoRecordId: string;
  eventLinkageId: string;
  eventId: string;
  linkageId: string;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  token: string;
  executeTime: number;
  type: string;
  extranetFilePath: string;
  intranetFilePath: string;
}
export class CubeLinkageService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 根据事件获取摄像机动作列表 */
  public async getVideoListByEventId(eventId: string): Promise<EventVideo[]> {
    const url = `${baseURL}/linkage/event-video/${eventId}`;
    const resp = await this.gateway.get<{ data: EventVideo[] }>({ url });
    return resp.data || resp;
  }

  /** 获取报警详情 */
  public async getAlarmRecordDetail(businessKey: string): Promise<GetAlarmRecordDetail> {
    const url = `${baseURL}/alarm/alarm-record/${businessKey}`;
    const resp = await this.gateway.get<{ data: GetAlarmRecordDetail }>({ url });
    return resp.data || resp;
  }

  /** 再次推送联动报警 */
  public async repeatPushAlarm(id: string): Promise<unknown> {
    const url = `${baseURL}/linkage/rule/re-trigger-event/${id}`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return resp.data || resp;
  }

  /** 根据事件获取摄像机动作执行附件列表 */
  public async getEventVideoImages(payload: { eventId: string }): Promise<MediaState[]> {
    const url = `${baseURL}/linkage/event-video-file-paths/${payload.eventId}`;
    const resp = await this.gateway.get<MediaState[]>({
      url,
    });
    return resp;
  }

  /** 报警事件记录分页 */
  public async getAlarmEventRecordPage(payload: {
    pageNumber: number;
    pageSize: number;
    period?: string;
    level?: string;
    applicationCode?: string;
    assistConfirmResult?: string;
    keyword?: string;
  }): Promise<Pagination<AlarmEventRecord>> {
    const url = `${baseURL}/linkage/event-records`;
    const resp = await this.gateway.get<Pagination<AlarmEventRecord>>({ url, payload });
    return resp;
  }

  /** 报警事件记录详情 */
  public async getAlarmEventRecordDetails(id: string): Promise<AlarmEventRecord> {
    const url = `${baseURL}/linkage/event-records/${id}`;
    const resp = await this.gateway.get<AlarmEventRecord>({ url });
    return resp;
  }
}
