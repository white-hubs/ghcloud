import { request } from '@/service/index'
const baseUrl = '/tj-electronic-guide'

export async function getPointList (params: unknown): Promise<Service.RequestResult> {
  return request.get(baseUrl + '/public/tj/point/anage/page', { params })
}
export async function createPoint (data: unknown): Promise<Service.RequestResult> {
  return request.post(baseUrl + '/tj/point/anage/add', data)
}
export async function getPointInfo (id: string): Promise<Service.RequestResult> {
  return request.get(baseUrl + `/public/tj/point/anage/${id}`)
}
export async function updatePoint (data: unknown): Promise<Service.RequestResult> {
  return request.put(baseUrl + '/tj/point/anage/update', data)
}
export async function deletePoint (id: unknown): Promise<Service.RequestResult> {
  return request.delete(baseUrl + `/tj/point/anage/${id}`)
}
