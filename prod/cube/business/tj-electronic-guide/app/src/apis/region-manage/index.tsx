import { request } from '@/service/index'
const baseUrl = '/tj-electronic-guide'

export async function getAreaList (params: unknown): Promise<Service.RequestResult> {
  return request.get(baseUrl + '/public/tj/guide/area/page', { params })
}
export async function createArea (data: unknown): Promise<Service.RequestResult> {
  return request.post(baseUrl + '/tj/guide/area/add', data)
}
export async function getAreaInfo (id: string): Promise<Service.RequestResult> {
  return request.get(baseUrl + `/public/tj/guide/area/${id}`)
}
export async function updateArea (data: unknown): Promise<Service.RequestResult> {
  return request.put(baseUrl + '/tj/guide/area/update', data)
}
export async function deleteArea (id: string): Promise<Service.RequestResult> {
  return request.delete(baseUrl + `/tj/guide/area/${id}`)
}
