import { request } from '@/service/index'
const baseUrl = '/tj-electronic-guide'
export async function addLayerImage (data: unknown): Promise<Service.RequestResult> {
  return request.post(baseUrl + '/tj/layer/add', data)
}
export async function getLayerImageList (params: unknown): Promise<Service.RequestResult> {
  return request.get(baseUrl + '/public/tj/layer/page', { params })
}
export async function updateLayerImage (data: unknown): Promise<Service.RequestResult> {
  return request.put(baseUrl + '/tj/layer/update', data)
}
export async function getLayerImageDetail (id: string): Promise<Service.RequestResult> {
  return request.get(baseUrl + `/public/tj/layer/${id}`)
}
export async function updateLayerImageState (data: unknown): Promise<Service.RequestResult> {
  return request.post(baseUrl + '/tj/layer/updateState', data)
}
export async function deleteLayerImage (id: string): Promise<Service.RequestResult> {
  return request.delete(baseUrl + `/tj/layer/${id}`)
}
export async function getUsingLayerDetails (): Promise<Service.RequestResult> {
  return request.get(baseUrl + '/public/tj/layer/state')
}
