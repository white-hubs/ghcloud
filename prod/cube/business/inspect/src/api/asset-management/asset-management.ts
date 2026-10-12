import { request } from '@/service/index'
import type { MsgConfig, MessageConfigInfo } from '@/api/asset-management/types'

/** 消息配置 保存 */
export const assemblyNoticeSave = async (params: { businessType: string; conditions: unknown[]; }):
Promise<Service.RequestResult<boolean>> => {
  return request.post('/maintain/notice/insert', params)
}

/** 消息配置 查询 */
export const queryByBusinessType = async (): Promise<Service.RequestResult<
{
  businessType: string;
  conditions: any[];
}
>> => {
  return request.get('/maintain/notice/queryByBusinessType?businessType=MAINTAIN')
}

/** 通知方式 */
export const sceneReceive = async (code: string):
Promise<Service.RequestResult<boolean>> => {
  return request.get(`/message2/sat-msg-scene-receive/code/${code}`)
}

/** 添加消息配置 */
export const addConfig = async (params: { businessType: string;sceneConfigDTOS: MsgConfig[]; }):
Promise<Service.RequestResult<boolean>> => {
  return request.post('/bracing/message/addConfig', params)
}

/** 添加消息配置 */
export const getConfigInfo = async (code: string):
Promise<Service.RequestResult<MessageConfigInfo[]>> => {
  return request.get(`/bracing/message/getConfigInfo?businessType=${code}`)
}

export interface OSSFile {
  businessKey: number;
  id: number;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  type: string;
}