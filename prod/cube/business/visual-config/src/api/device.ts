import request from '@/service/request'
import type { DeviceGenreType, DeviceSceneConfig, DeviceType } from './models/device'
const baseUrl = '/api/device/'
/**
 * 获取设备类型
 */
export async function getDeviceGenreList<T extends Record<string, unknown>> (params?: T): Promise<DeviceGenreType[]> {
  return request<DeviceGenreType[]>({
    url: baseUrl + 'device/genre/search',
    method: 'GET',
    params,
  })
}
/**
 * 设备查询
 */
export async function getDevicePage<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<DeviceType>> {
  return request<ReturnPageType<DeviceType>>({
    url: baseUrl + 'device/instance/list-page',
    method: 'GET',
    params
  })
}
/**
 * 设施场景配置查询
 */
export async function deviceSceneConfig<T extends Record<string, unknown>> (params: T): Promise<DeviceSceneConfig[]> {
  return request<DeviceSceneConfig[]>({
    url: baseUrl + `device-scene-configs/business/${params.businessId}`,
    method: 'GET',
    params
  })
}
/**
 * 设施场景配置
 */
export async function submitBusinessSceneConfig<T extends Record<string, unknown>> (data: T): Promise<string> {
  return request<string>({
    url: baseUrl + 'device-scene-config',
    method: 'POST',
    data
  })
}
