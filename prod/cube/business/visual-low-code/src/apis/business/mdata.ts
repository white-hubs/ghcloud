import { request } from '@/service/index'
import type { MediaConfigType } from './device.i'
const baseURL = '/mdata/'
/**
 * 流媒体服务器配置详情
 */
export const mediaConfig = async (): Promise<Service.RequestResult<MediaConfigType>> => {
  return request.get(baseURL + 'stream-media-config')
}
/**
 * 获取登录会话信息
 */
export const loginSession = async (): Promise<Service.RequestResult<any>> => {
  return request.get(baseURL + 'video-ptz/login-session')
}
/**
* 获取流媒体配置
*/
export const getStreamMediaConfig = async (): Promise<Service.RequestResult<any>> => {
  return request.get(baseURL + '/stream-media-configs')
}
