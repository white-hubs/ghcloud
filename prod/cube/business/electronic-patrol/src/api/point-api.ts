import { request, service } from '@/service/index'
const baseUrl = '/maintain'
/** 系统配置 通用分类分页查询 */
export const pointPage = async (data: Plan.FormState): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/patrol/location/page', {
    params: {
      ...data
    }
  })
}
export const addpoint = async (data: Plan.AddPoint): Promise<Service.RequestResult> => {
  return request.post(baseUrl + '/patrol/location/insert',
    data
  )
}
export const updatepoint = async (data: Plan.AddPoint): Promise<Service.RequestResult> => {
  return request.put(baseUrl + '/patrol/location/update',
    data
  )
}
export const deletepoint = async (id: string): Promise<Service.RequestResult> => {
  return request.delete(baseUrl + `/patrol/location/${id}`, {
  })
}

export const downloadTpl = async (): Promise<Service.RequestResult> => {
  return service.post(baseUrl + '/patrol/location/getTemplateExcel', {
  })
}
