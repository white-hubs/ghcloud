export interface MessageConfigInfo {
  label: string;
  sceneCode: string;
  value: number;
  noticeWays: {
    noticeWay: string;
    templateId: string | null;
  }[];
  noticeObjs: {
    objType: string;
    objId: string;
    objInfo: string;
  }[];
}

/**
 * AssemblyNoticeParam
 */
export interface MsgConfig {
  /**
   * 业务类型
   */
  businessType?: string;
  condition?: KeyValueVO[];
  /**
   * 消息配置
   */
  msgConfig?: SatMsgConfigBatchCreateParam;
  noticeType?: NoticeTypeParam[];
  noticeObjs?: MsgConfigNoticeObj[];
}

export interface MsgConfigNoticeObj {
  objType: string;
  objId: string;
  objInfo: string;
}

/**
* 通知条件：XX分钟
*
* KeyValueVO
*/
export interface KeyValueVO {
  /**
   * 名称
   */
  name?: string;
  /**
   * 值
   */
  value?: number;
}

/**
* 消息配置
*
* SatMsgConfigBatchCreateParam
*/
export interface SatMsgConfigBatchCreateParam {
  params?: SatMsgConfigModifyParam[];
}

/**
* SatMsgConfigModifyParam
*/
export interface SatMsgConfigModifyParam {
  effectiveDays?: number;
  enabled?: boolean;
  msgTmpContent: string;
  notifyExpression?: string;
  satMsgChannelConfigModifyParams?: SatMsgChannelConfigModifyParam[];
  satMsgDefineCode: string;
}

/**
* SatMsgChannelConfigModifyParam
*/
export interface SatMsgChannelConfigModifyParam {
  channelType?: ChannelType;
  terminal?: string;
  terminalName?: string;
}

export enum ChannelType {
  CHANNELAPP = 'CHANNEL_APP',
  CHANNELSMS = 'CHANNEL_SMS',
  CHANNELSITE = 'CHANNEL_SITE',
}

/**
* 通知人员方式
*
* NoticeTypeParam
*/
export interface NoticeTypeParam {
  /**
   * 名称
   */
  name?: string;
  value?: Record<string, unknown>[];
}
