import type {
  ChannelCodesType,
  MsgChannel,
  MsgDetail,
  MsgRecordCustomGroupItem,
  MsgRecordCustomGroupStatistics,
  MsgRecordPageVO,
  MsgSceneReceive,
  MsgSceneReceiveDetail,
  MsgTemplate,
  ReceiveMode,
  ReferManufacturers,
  User,
  SceneConfigDTO,
  LineLossList,
} from "./types";
import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";
export interface SatMsgSceneReceive {
  id: string;
  msgSceneCode: string;
  msgSceneName: string;
  applicationCode: string;
  applicationName: string;
  channelCodes: string[];
}
export interface SatMsgChannels {
  channelCode: ChannelCodesType;
  channelName: string;
  manufacturerCode: string;
  manufacturerName: string;
  config: string;
}
export class CubeMessageCenterService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 消息自定义分组统计 */
  public async geMsgRecordCustomGroupStatistics(channelType: string): Promise<MsgRecordCustomGroupStatistics[]> {
    const url = `${BASE_API}/message2/msg-record/custom-group/${channelType}/statistics`;
    const resp = await this.gateway.get<LegacyServiceError<MsgRecordCustomGroupStatistics[]>>({
      url,
    });
    return resp.data || resp;
  }

  /** 自定义分组的消息列表 */
  public async geMsgRecordCustomGroupPage(payload: {
    /**
     * 应用编号
     */
    applicationCode?: string;
    /**
     * 类别(区分是自定义类型or应用)
     */
    category?: string;
    /**
     * 通道类型
     */
    channelType: string;
    /**
     * 自定义分类编号
     */
    customType?: string;
    /**
     * 是否已读
     */
    hasRead?: string;
    /**
     * 关键字
     */
    keyword?: string;
    /**
     * 时间范围
     */
    period?: string;
    pageSize: number;
    pageNumber: number;
  }): Promise<{ records: MsgRecordCustomGroupItem[]; total: number; pages: number }> {
    const url = `${BASE_API}/message2/msg-record/custom-group/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: MsgRecordCustomGroupItem[]; total: number; pages: number }>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  /** 消息详情 */
  public async geMsgRecordById(id: string): Promise<MsgRecordCustomGroupStatistics> {
    const url = `${BASE_API}/message2/msg-record/${id}`;
    const resp = await this.gateway.get<LegacyServiceError<MsgRecordCustomGroupStatistics>>({
      url,
    });
    return resp.data || resp;
  }

  /** 消息列表 分页 */
  public async getMsgRecordsPage(payload: {
    pageNumber: number;
    pageSize: number;
    channelType?: string | undefined;
    businessType?: string | undefined;
    msgType?: string | undefined;
    applicationCode?: string | undefined;
    customType?: string | undefined;
    category?: string | undefined;
    hasRead?: boolean;
    period?: string | undefined;
    sendStatus?: boolean | undefined;
    sourceTenant?: number | string | undefined;
  }): Promise<{ records: MsgRecordPageVO[]; total: number }> {
    const url = `${BASE_API}/message2/msg-records`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: MsgRecordPageVO[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  // 用户消息忽略配置保存
  public async setIgnoredConfig(payload: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    tomorrows?: boolean;
    channels: string[];
  }): Promise<unknown[]> {
    const url = `${BASE_API}/message2/sat-user-msg/ignored-config`;
    const resp = await this.gateway.create<LegacyServiceError<unknown[]>>({
      url,
      payload,
    });
    return resp.data || resp;
  }

  // 用户消息忽略配置开关修改
  public async updateIgnoredConfig(enabled: string): Promise<unknown[]> {
    const url = `${BASE_API}/message2/sat-user-msg/ignored-config/enabled/${enabled}`;
    const resp = await this.gateway.update<LegacyServiceError<unknown[]>>({
      url,
    });
    return resp.data || resp;
  }

  // 用户消息忽略配置详情
  public async getIgnoredConfig(): Promise<{ startTime?: string; endTime?: string; enabled?: boolean; channels?: string[] }> {
    const url = `${BASE_API}/message2/sat-user-msg/ignored-config`;
    const resp = await this.gateway.get<
      LegacyServiceError<{
        startTime?: string;
        endTime?: string;
        enabled?: boolean;
        channels?: string[];
      }>
    >({
      url,
    });
    return resp.data || resp;
  }

  // 获取消息通知渠道
  public async satMsgChannels(): Promise<SatMsgChannels[]> {
    const url = "/api/message2/sat-msg-channels";
    const res = await this.gateway.get<SatMsgChannels[]>({ url });
    return res;
  }

  // 获取消息通知方式枚举
  public async satMsgSceneReceive(code: string): Promise<SatMsgSceneReceive> {
    const url = `/api/message2/sat-msg-scene-receive/code/${code}`;
    const res = await this.gateway.get<SatMsgSceneReceive>({ url });
    return res;
  }

  // 过滤出当前场景下选中的通知方式
  public async sceneNotificationMethod(code: string): Promise<
    {
      value: string;
      label: string;
    }[]
  > {
    const allChannels = await this.satMsgChannels();
    const selectChannels = await this.satMsgSceneReceive(code);
    const filteredData = allChannels.filter((item) => selectChannels.channelCodes.includes(item.channelCode));
    return filteredData.map((e) => {
      return {
        label: e.channelName,
        value: e.channelCode,
      };
    });
  }

  /** 消息列表 分页 */
  public async getMsgRecordsList(payload: {
    applicationCode?: string | undefined;
    businessType?: string | undefined;
    category?: string | undefined;
    /**
     * 通道类型
     * CHANNEL_SITE :站内信消息
     * CHANNEL_APP :app消息
     * CHANNEL_SMS :短信消息
     * CHANNEL_VOICE :语音通知
     */
    channelType?: string | undefined;
    customType?: string | undefined;
    msgType?: string | undefined;
    pageNumber: number;
    pageSize: number;
    period?: string | undefined;
    sendStatus?: boolean | undefined;
  }): Promise<{ records: MsgRecordPageVO[]; total: number }> {
    const url = `${BASE_API}/message2/msg-records`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: MsgRecordPageVO[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /** 消息-删除 */
  public async delMessage(id: string): Promise<void> {
    const url = `${BASE_API}/message2/msg-record/${id}`;
    await this.gateway.delete({ url });
  }

  /** 消息-删除 */
  public async delBatchMessage(payload: { ids: string[] }): Promise<void> {
    const url = `${BASE_API}/message2/msg-record/batch`;
    await this.gateway.delete({ url, payload });
  }

  /** 消息详情 */
  public async getMessageDetail(id: string): Promise<MsgDetail> {
    const url = `${BASE_API}/message2/msg-record/${id}`;
    const resp = await this.gateway.get<LegacyServiceError<MsgDetail>>({ url });
    return resp.data || resp;
  }

  /** 消息批量已读 */
  public async readBatchMessage(ids: string[]): Promise<void> {
    const url = `${BASE_API}/message2/msg-record/read-batch`;
    await await this.gateway.custom<unknown>({
      url,
      payload: ids,
      method: "PUT",
    });
  }

  /** 消息一键已读 */
  public async readAllMessage(payload: { channelType: string }): Promise<void> {
    const url = `${BASE_API}/message2/msg-record/read-all/${payload.channelType}`;
    await this.gateway.update({ url, payload });
  }

  /** 运营端消息通道列表 */
  public async getMsgChannels(): Promise<MsgChannel[]> {
    const url = `${BASE_API}/message2/msg-channels`;
    const resp = await this.gateway.get<LegacyServiceError<MsgChannel[]>>({ url });
    return resp.data || resp;
  }

  /** 消息模板 分页 */
  public async getMsgTemplatePage(payload: {
    applicationCode?: string | undefined;
    channelCode?: string | undefined;
    keyword?: string | undefined;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: MsgTemplate[]; total: number }> {
    const url = `${BASE_API}/message2/sat-msg-tmp/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: MsgTemplate[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /** 消息场景接收配置列表*/
  public async getMsgSceneReceivesPage(payload: {
    applicationCode?: string | undefined;
    keyword?: string | undefined;
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: MsgSceneReceive[]; total: number }> {
    const url = `${BASE_API}/message2/sat-msg-scene-receives`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: MsgSceneReceive[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }
  /** 通道下已接入的厂家列表 */
  public async getReferManufacturers(code: string): Promise<ReferManufacturers[]> {
    const url = `${BASE_API}/message2/msg-channel/${code}/refer-manufacturers`;
    const resp = await this.gateway.get<LegacyServiceError<ReferManufacturers[]>>({ url });
    return resp.data || resp;
  }

  /** 租户通道厂家配置-新增 */
  public async saveSatMsgChannel(payload: {
    channelCode: ChannelCodesType | undefined;
    config: string | undefined;
    enabled?: boolean;
    manufacturerCode: string | undefined;
  }): Promise<void> {
    const url = `${BASE_API}/message2/sat-msg-channel`;
    await await this.gateway.custom<unknown>({
      url,
      payload,
      method: "POST",
    });
  }
  /** 模板配置设置 */
  public async updateMsgTemplateConfig(
    id: string,
    payload: {
      config?: string | undefined;
    },
  ): Promise<void> {
    const url = `${BASE_API}/message2/sat-msg-tmp/${id}/setting-config`;
    await await this.gateway.custom<unknown>({
      url,
      payload,
      method: "POST",
    });
  }

  /** 模板配置-更新应用 */
  public async refreshMsgTemplate(): Promise<void> {
    const url = `${BASE_API}/message2/sat-msg-scene/refresh-application`;
    await await this.gateway.custom<unknown>({
      url,
      method: "POST",
    });
  }

  /** 模板配置-更新模板 */
  public async refreshSatMsgTmp(): Promise<void> {
    const url = `${BASE_API}/message2/sat-msg-tmp/refresh`;
    await this.gateway.custom<unknown>({
      url,
      method: "POST",
    });
  }

  /** 消息场景接收模式设置 */
  public async updateMsgSettingMode(
    id: string,
    payload: {
      receiveMode: ReceiveMode | undefined;
      users?: User[];
    },
  ): Promise<void> {
    const url = `${BASE_API}/message2/sat-msg-scene-receive/${id}/setting-mode`;
    await this.gateway.update({ url, payload });
  }

  /** 消息场景接收模式设置-详情 */
  public async getMsgSceneReceiveDetail(code: string): Promise<MsgSceneReceiveDetail> {
    const url = `${BASE_API}/message2/sat-msg-scene-receive/code/${code}`;
    const resp = await this.gateway.get<LegacyServiceError<MsgSceneReceiveDetail>>({ url });
    return resp.data || resp;
  }

  /** 消息场景接收通道设置 */
  public async updateMsgSettingChannel(id: string, channelCode: string): Promise<void> {
    const url = `${BASE_API}/message2/sat-msg-scene-receive/${id}/setting-channel/${channelCode}`;
    await this.gateway.update({ url });
  }

  /** 消息场景接收通道设置-删除 */
  public async deleteMsgSettingChannel(id: string, channelCode: string): Promise<void> {
    const url = `${BASE_API}/message2/sat-msg-scene-receive/${id}/setting-channel/${channelCode}`;
    await this.gateway.delete({ url });
  }

  /** 获取未读消息数量 */
  public async getUnReadMsgNum(): Promise<number> {
    const url = `${BASE_API}/message2/msg-record/un-read/total/CHANNEL_SITE`;
    const resp = await this.gateway.get<number>({ url });

    return resp;
  }

  /** 用户消息忽略配置详情 */
  public async getMessageConfig(payload: { businessType: string; label?: string }): Promise<SceneConfigDTO[]> {
    const url = `${BASE_API}/bracing/message/getConfigInfo`;
    const resp = await this.gateway.get<SceneConfigDTO[]>({
      url,
      payload,
    });
    return resp;
  }

  /** 用户消息忽略配置详情 */
  public async addMessageConfig(payload: Record<string, unknown>): Promise<string> {
    const url = `${BASE_API}/bracing/message/addConfig`;
    const resp = await this.gateway.create<string>({
      url,
      payload,
    });
    return resp;
  }

  /** 分页查询线损线路 */
  public async getLineLossList(payload: {
    pageSize: number;
    pageNumber: number;
    lineName?: string;
  }): Promise<{ total: number; pages: number; records: LineLossList }> {
    const url = `${BASE_API}/securitymanagement/lineLoss/connection/page`;
    const resp = await this.gateway.get<{ total: number; pages: number; records: LineLossList }>({
      url,
      payload,
    });
    return resp;
  }
}
