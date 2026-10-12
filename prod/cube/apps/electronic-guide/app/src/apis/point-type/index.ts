import { request } from '@/service/index'
const baseUrl = '/electron-guide'
/**
 * 获取点位类型列表
 * @param params
 * @returns
 */
export async function getPointTypePage (params: unknown): Promise<Service.RequestResult> {
  return request.get(baseUrl + '/point-type/page', { params })
}
/**
 * 保存点位类型
 */
export async function createPointType (data: unknown): Promise<Service.RequestResult> {
  return request.post(baseUrl + '/point-type', data)
}
/**
 * 获取点位类型列表
 */
export async function getPointTypeList (params?: unknown): Promise<Service.RequestResult> {
  return request.get(baseUrl + '/point-types', { params })
}
/**
 * 更新点位类型
 */
export async function updatePointType (id: string, data: unknown): Promise<Service.RequestResult> {
  return request.put(baseUrl + `/point-type/${id}`, data)
}
/**
 * 删除点位类型
 */
export async function deletePointType (id: string): Promise<Service.RequestResult> {
  return request.delete(baseUrl + `/point-type/${id}`)
}
