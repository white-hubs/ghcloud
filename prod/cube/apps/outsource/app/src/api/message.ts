import { Get, Post, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'

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