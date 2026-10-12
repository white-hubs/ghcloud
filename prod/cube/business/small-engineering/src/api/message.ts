import { Get, Put, Post, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'

const baseUrl = 'message'
const baseUrl1 = '/bracing'

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
  value: number;
}

export const satMsgConfigs = async (params: {
  satMsgDefineCodes: string;
}): Promise<BaseAPIResult> => {
  return Get(baseUrl + '/sat-msg-configs/', {
    params
  })
}
export const satMsgConfig = async (data: {
  params: {
    msgTmpContent: string;
  }[];
}): Promise<BaseAPIResult> => {
  return Put(baseUrl + '/sat-msg-config',
    data)
}
export const addSatMsgConfig = async (data: {
  params: {
    msgTmpContent: string;
  }[];
}): Promise<BaseAPIResult> => {
  return Post(baseUrl + '/sat-msg-config',
    data)
}

export const getNewMessage = async (params: {
  businessType: string;
  label: string;
}): Promise<BaseAPIResult<SceneConfigDTO[]>> => {
  return Get(baseUrl1 + '/message/getConfigInfo', {
    params: {
      ...params
    }
  })
}

export const addNewMessage = async (data: unknown): Promise<BaseAPIResult< { code: string; name: string; }[]>> => {
  return Post(baseUrl1 + '/message/addConfig', data)
}
/** 消息配置2.0 通知方式code */
export const getNoticeCode = async (code: string): Promise<BaseAPIResult> => {
  return Get(
    `/message2/sat-msg-scene-receive/code/${code}`
  )
}
