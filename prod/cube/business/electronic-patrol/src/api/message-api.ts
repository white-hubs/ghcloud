import { request } from '@/service/index'
const baseUrl = '/maintain'
const baseUrl1 = '/bracing'
/** 系统配置 通用分类分页查询 */
export const getnewmessage = async (params: {
  businessType: string;
  label: string;
}): Promise<Service.RequestResult> => {
  return request.get(baseUrl1 + '/message/getConfigInfo', {
    params: {
      ...params
    }
  })
}
export const getmessage = async (): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/electron/queryMessget')
}
export const addmessage = async (data: any): Promise<Service.RequestResult< { code: string; name: string; }[]>> => {
  return request.post(baseUrl + '/electron/messget/insert', data)
}
export const addnewmessage = async (data: any): Promise<Service.RequestResult< { code: string; name: string; }[]>> => {
  return request.post(baseUrl1 + '/message/addConfig', data)
}
