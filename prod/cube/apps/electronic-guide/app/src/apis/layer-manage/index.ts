import { request } from '@/service/index'
const baseUrl = '/electron-guide'
export async function addLayerImage (data: unknown): Promise<Service.RequestResult> {
  return request.post(baseUrl + '/layer/add', data)
}
export async function getLayerImageList (params: unknown): Promise<Service.RequestResult> {
  return request.get(baseUrl + '/public/layer/page', { params })
}
export async function updateLayerImage (data: unknown): Promise<Service.RequestResult> {
  return request.put(baseUrl + '/layer/update', data)
}
export async function getLayerImageDetail (id: string): Promise<Service.RequestResult> {
  return request.get(baseUrl + `/public/layer/${id}`)
}
export async function updateLayerImageState (data: unknown): Promise<Service.RequestResult> {
  return request.post(baseUrl + '/layer/updateState', data)
}
export async function deleteLayerImage (id: string): Promise<Service.RequestResult> {
  return request.delete(baseUrl + `/layer/${id}`)
}
export async function getUsingLayerDetails (params: unknown): Promise<Service.RequestResult> {
  return request.get(baseUrl + '/public/layer/state', { params })
}
