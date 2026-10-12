import { request } from '@/service/index'
import type { MsgApplicationsType, MsgChannels, MsgReceivesType, MsgTmpPageType, ReferManufacturersType } from './model/message'
let baseURL = "/message2";
/**
 * 租户消息应用列表
 */
export const msgApplications = async (): Promise<Service.RequestResult<MsgApplicationsType[]>> => {
  return request.get(baseURL+'/sat-msg-applications')
}
/**
 * 消息场景接收配置列表
 */
export const msgReceives = async (
  params: {
    applicationCode: string;
    keyword: string;
  }): Promise<Service.RequestResult<MsgReceivesType[]>> => {
  return request.get(baseURL+'/sat-msg-scene-receives', { params })
}
/**
 * 租户通道列表
 */
export const msgChannels = async (): Promise<Service.RequestResult<MsgChannels[]>> => {
  return request.get(baseURL+'/sat-msg-channels')
}
/**
 * 刷新应用
 */
export const refreshApplication = async (): Promise<Service.RequestResult<MsgChannels[]>> => {
  return request.post(baseURL+'/sat-msg-scene/refresh-application')
}
/**
 * 通道下已接入的厂家列表
 */
export const referManufacturers = async (code:string): Promise<Service.RequestResult<ReferManufacturersType[]>> => {
  return request.get(baseURL+`/msg-channel/${code}/refer-manufacturers`)
}
/**
 * 租户通道厂家配置新增
 */
export const msgChannel = async (params:any): Promise<Service.RequestResult> => {
  return request.post(baseURL+'/sat-msg-channel',params)
}
/**
 * 模板分页列表
 */
export const msgTmpPage = async (params:{
  keyword:string;
  applicationCode:string;
  channelCode:string;
  pageNumber:number;
  pageSize	:number;
}): Promise<Service.RequestResult<MsgTmpPageType[]>> => {
  return request.get(baseURL+'/sat-msg-tmp/page',{params})
}
/**
 * 模板配置设置
 */
export const settingConfig = async ( id:string,params): Promise<Service.RequestResult> => {
  return request.post(baseURL+`/sat-msg-tmp/${id}/setting-config`,params)
}
/**
 * 消息场景接收通道设置
 */
export const settingChannel = async ( id:string,channelCode:string): Promise<Service.RequestResult> => {
  return request.put(baseURL+`/sat-msg-scene-receive/${id}/setting-channel/${channelCode}`)
}
/**
 * 删除消息场景接收通道设置
 */
export const deleteChannel = async ( id:string,channelCode:string): Promise<Service.RequestResult> => {
  return request.delete(baseURL+`/sat-msg-scene-receive/${id}/setting-channel/${channelCode}`)
}
// 用户列表
 export const getAuthenticatedUserPage = async (params): Promise<Service.RequestResult> => {
  return request.get(`/ouaa/authenticated/user/page`,
    {params}
  )
}
// 消息场景接收模式设置
 export const settingMode = async (id,params): Promise<Service.RequestResult> => {
  return request.put(baseURL+`/sat-msg-scene-receive/${id}/setting-mode`,
    params
  )
}
// 消息场景接收配置详情
 export const sceneReceive = async (code): Promise<Service.RequestResult> => {
  return request.get(baseURL+`/sat-msg-scene-receive/code/${code}`
  )
}
// 获取当前用户所登录产品的访问端列表
 export const contextTerminals = async (): Promise<Service.RequestResult> => {
  return request.get(`/ouaa/context-terminals`
  )
}
// 添加消息配置
 export const addConfig = async (data): Promise<Service.RequestResult> => {
  return request.post(`/bracing/message/addConfig`,data
  )
}
// 消息场景接收配置详情
export const getSceneReceive = async (code): Promise<Service.RequestResult> => {
  return request.get(`/message2/sat-msg-scene-receive/code/${code}`
  )
}
// 查询消息配置
export const getConfigInfo = async (code): Promise<Service.RequestResult> => {
  return request.get(`/bracing/message/getConfigInfo?businessType=${code}`
  )
}