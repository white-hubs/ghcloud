/** 消息自定义分组统计 item */
export interface MsgRecordCustomGroupStatistics {
  type: string;
  typeName: string;
  category: "custom" | "application";
  unReadMsgCount: number;
  lastMsgRecord: MsgRecordCustomGroupItem | null;
}

export interface MsgRecordPageVO {
  /**
   * 应用编号
   */
  applicationCode?: string;
  /**
   * 应用名称
   */
  applicationName?: string;
  /**
   * 业务主键
   */
  businessId?: string;
  /**
   * 业务类型
   */
  businessType?: string;
  /**
   * 消息通道编号
   */
  channelCode?: ChannelCodesType;
  /**
   * 有效天数
   */
  effectiveDays?: number;
  /**
   * 过期时间
   */
  expirationTime?: string;
  /**
   * 是否已读
   */
  hasRead?: boolean;
  id?: number;
  /**
   * 厂家编号
   */
  manufacturerCode?: string;
  /**
   * 消息内容
   */
  msgContent?: string;
  /**
   * 消息参数
   */
  msgParams?: string;
  /**
   * 消息场景编号
   */
  msgSceneCode?: string;
  /**
   * 消息场景名称
   */
  msgSceneName?: string;
  /**
   * 消息模板主键
   */
  msgTmpId?: number;
  /**
   * 消息类型
   */
  msgType?: string;
  /**
   * 发送时间
   */
  sendTime?: string;
  /**
   * 跳转地址
   */
  url?: string;
  sourceTenantName?: string;
  businessPrincipal?: string;
  satMsgDefineCode?: string;
}
/** 消息自定义分组 item */
export interface MsgRecordCustomGroupItem {
  /**
   * 应用编号
   */
  applicationCode?: string;
  /**
   * 应用名称
   */
  applicationName?: string;
  /**
   * 业务主键
   */
  businessId?: string;
  /**
   * 业务类型
   */
  businessType?: string;
  /**
   * 消息通道编号
   */
  channelCode?: ChannelCodesType;
  /**
   * 有效天数
   */
  effectiveDays?: number;
  /**
   * 过期时间
   */
  expirationTime?: string;
  /**
   * 是否已读
   */
  hasRead?: boolean;
  id: string;
  /**
   * 厂家编号
   */
  manufacturerCode?: string;
  /**
   * 消息内容
   */
  msgContent?: string;
  /**
   * 消息参数
   */
  msgParams?: string;
  /**
   * 消息场景编号
   */
  msgSceneCode?: string;
  /**
   * 消息场景名称
   */
  msgSceneName?: string;
  /**
   * 消息模板主键
   */
  msgTmpId?: number;
  /**
   * 消息类型
   */
  msgType?: string;
  /**
   * 发送时间
   */
  sendTime: number;
  /**
   * 跳转地址
   */
  url?: string;
  sourceTenantName?: string;
  businessPrincipal?: string;
  satMsgDefineCode?: string;
}

/**
 * 通道枚举
 */
export enum ChannelCodesType {
  CHANNEL_APP = "CHANNEL_APP",
  CHANNEL_SMS = "CHANNEL_SMS",
  CHANNEL_SITE = "CHANNEL_SITE",
  CHANNEL_VOICE = "CHANNEL_VOICE",
}

export interface MsgDetail {
  /**
   * 应用编号
   */
  applicationCode?: string;
  /**
   * 应用名称
   */
  applicationName?: string;
  /**
   * 业务主键
   */
  businessId?: string;
  /**
   * 业务类型
   */
  businessType?: string;
  /**
   * 消息通道编号
   */
  channelCode?: ChannelCodesType;
  /**
   * 有效天数
   */
  effectiveDays?: number;
  /**
   * 过期时间
   */
  expirationTime?: string;
  id?: number;
  /**
   * 厂家编号
   */
  manufacturerCode?: string;
  /**
   * 消息内容
   */
  msgContent?: string;
  /**
   * 消息参数
   */
  msgParams?: string;
  /**
   * 消息编号
   */
  msgSceneCode?: string;
  /**
   * 消息名称
   */
  msgSceneName?: string;
  /**
   * 消息模板主键
   */
  msgTmpId?: number;
  /**
   * 消息类型
   */
  msgType?: string;
  /**
   * 跳转地址
   */
  url?: string;
}
export interface MsgTemplate {
  /**
   * 应用编号
   */
  applicationCode: string;
  /**
   * 应用名称
   */
  applicationName: string;
  /**
   * 通道编号
   */
  channelCode: ChannelCodesType;
  /**
   * 模板内容
   */
  content: string;
  /**
   * 是否启用
   */
  enabled: boolean;
  id: string;
  /**
   * 场景编码
   */
  msgSceneCode: string;
  /**
   * 场景名称
   */
  msgSceneName: string;
  /**
   * 模板名称
   */
  name: string;
  config?: string;
  available?: string;
}
export interface MsgChannel {
  /**
   * 通道编号
   */
  code: string;
  id: string;
  /**
   * 通道名称
   */
  name: string;
}
export interface SatMsgChannels {
  /**
   * 通道编码
   */
  channelCode: ChannelCodesType;
  /**
   * 通道名称
   */
  channelName: string;
  /**
   * 厂家配置信息，String类型的json串
   */
  config: string;
  /**
   * 厂家编号
   */
  manufacturerCode: string;
  /**
   * 厂家名称
   */
  manufacturerName: string;
}
export interface MsgSceneReceive {
  /**
   * 应用编号
   */
  applicationCode: string;
  /**
   * 应用名称
   */
  applicationName: string;
  /**
   * 发送的通道
   */
  channelCodes: ChannelCodesType[];
  id: string;
  /**
   * 场景编号
   */
  msgSceneCode: string;
  /**
   * 场景名称
   */
  msgSceneName: string;
  /**
   * 接收模式
   */
  receiveMode: ReceiveMode;
}

/**
 * 接收模式
 *
 * ReceiveMode
 */
export enum ReceiveMode {
  DYNAMIC_APPLICATION = "DYNAMIC_APPLICATION",
  SPECIFY_USER = "SPECIFY_USER",
}

export interface User {
  userId: string;
  userName: string;
}
export interface MsgSceneReceiveDetail {
  /**
   * 应用编号
   */
  applicationCode: string;
  /**
   * 应用名称
   */
  applicationName: string;
  /**
   * 发送的通道
   */
  channelCodes: ChannelCodesType[];
  id: string;
  /**
   * 场景编号
   */
  msgSceneCode: string;
  /**
   * 场景名称
   */
  msgSceneName: string;
  /**
   * 接收模式
   */
  receiveMode: ReceiveMode;
  /**
   * 用户列表信息
   */
  users?: User[];
}
export interface ReferManufacturers {
  /**
   * 账号表单规则json
   */
  accountRule: string;
  /**
   * 厂家编号
   */
  code: string;
  /**
   * 厂家名称
   */
  name: string;
}

export interface AssemblyNoticeObjDTO {
  /**
   * 通知对象id
   */
  objId?: null | string | undefined;
  /**
   * 通知对象信息
   */
  objInfo?: null | string | undefined;
  /**
   * 通知对象类型
   */
  objType?: null | string | undefined;
}

export interface AssemblyNoticeWayDTO {
  /**
   * 通知方式
   */
  noticeWay: null | string;
  /**
   * 模板id
   */
  templateId: number | null;
}

export interface SceneConfigDTO {
  label: string;
  /**
   * 通知对象
   */
  noticeObjs?: AssemblyNoticeObjDTO[] | null;
  /**
   * 通知方式
   */
  noticeWays?: AssemblyNoticeWayDTO[] | null;
  /**
   * 消息场景编号
   */
  sceneCode: string;
  /**
   * 通知时间
   */
  value: string;
  /**
   * 业务参数
   */
  config: string;
}
export interface LineLossList {
  id: string;
  lineName: string;
  fromNodeLocation: string;
  toNodeLocation: string;
  fromDevice: {
    id: string;
    name: string;
  };
  toDevice: {
    id: string;
    name: string;
  };
}
