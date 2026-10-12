import { request } from '@/service/index'
const baseUrl = '/electron-guide'
/**
 * 导览设备分页列表
 * @param params
 * @returns
 */
export async function getGuideDeviceList (params: unknown): Promise<Service.RequestResult> {
  return request.get(baseUrl + '/guide/device/page', { params })
}
/**
 * 导览设备新增
 */
export async function createGuideDevice (params: unknown): Promise<Service.RequestResult> {
  return request.post(baseUrl + '/guide/device', params)
}
/**
 * 导览设备编辑
 */
export async function updateGuideDevice (id: string, params: unknown): Promise<Service.RequestResult> {
  return request.put(baseUrl + `/guide/device/${id}`, params)
}
/**
 * 导览设备删除
 */
export async function deleteGuideDevice (id: unknown): Promise<Service.RequestResult> {
  return request.delete(baseUrl + `/guide/device/${id}`)
}
