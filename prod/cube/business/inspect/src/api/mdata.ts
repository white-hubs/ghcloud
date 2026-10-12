import { request } from '@/service/index'
const baseURL = '/mdata'

// 区域管理接口 - 区域列表(区域管理)
export const getAreaList = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL + '/area/list')
}
