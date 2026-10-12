import { request } from '@/service/index'
const baseUrl = '/file'
export async function uploadFile<T> (data: T): Promise<Service.RequestResult> {
  return request.post(baseUrl + '/file', data)
}

export async function removeFile<T extends Record<string, unknown>> (params: T): Promise<Service.RequestResult> {
  return request.delete(baseUrl + `/file/${params.id}`)
}
