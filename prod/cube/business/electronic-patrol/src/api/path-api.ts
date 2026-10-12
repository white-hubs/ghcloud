import { request } from '@/service/index'
import type { LocationQueryValue } from 'vue-router'
const baseUrl = '/maintain'
/** 系统配置 通用分类分页查询 */
export const pathPage = async (data: Path.FormState): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/patrol/route/page', {
    params: {
      ...data
    }
  })
}
export const pathPageall = async (): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/patrol/route/all', {
  })
}
export const pathById = async (id: LocationQueryValue | LocationQueryValue[]): Promise<Service.RequestResult> => {
  return request.get(baseUrl + `/patrol/route/${id}`, {

  })
}
export const addpath = async (data: PATH.Addpath): Promise<Service.RequestResult> => {
  return request.post(baseUrl + '/patrol/route/insert',
    data
  )
}
export const updatepath = async (data: PATH.Addpath): Promise<Service.RequestResult> => {
  return request.put(baseUrl + '/patrol/route/update',
    data
  )
}
export const deletepath = async (id: string): Promise<Service.RequestResult> => {
  return request.delete(baseUrl + `/patrol/route/${id}`, {
  })
}
