import request from '@/service/request'
const baseUrl = '/api/file/'

export async function removeFile<T extends Record<string, unknown>> (params: T): Promise<string> {
  return request<string>({
    url: baseUrl + `file/${params.id}`,
    method: 'DELETE',
  })
}
