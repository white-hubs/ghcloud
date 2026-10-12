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




/**
* SceneConfigDTO
*/
export interface SceneConfigDTO {
  label: string;
  /**
   * 通知对象
   */
  noticeObjs: AssemblyNoticeObjDTO[];
  /**
   * 通知方式
   */
  noticeWays: AssemblyNoticeWayDTO[];
  /**
   * 消息场景编号
   */
  sceneCode: string;
  /**
   * 通知时间
   */
  value: number;
}

/**
* AssemblyNoticeObjDTO
*/
export interface AssemblyNoticeObjDTO {
  /**
   * 通知对象id
   */
  objId: string;
  /**
   * 通知对象类型
   */
  objType: string;
  objInfo:string
}

/**
* AssemblyNoticeWayDTO
*/
export interface AssemblyNoticeWayDTO {
  /**
   * 通知方式
   */
  noticeWay: string;
  /**
   * 模板id
   */
  templateId?: number;
}