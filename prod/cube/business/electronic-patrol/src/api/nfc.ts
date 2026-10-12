import { request, service } from '@/service/index'
const baseUrl = '/maintain'
/** 系统配置 通用分类分页查询 */
export const nfcPage = async (data: Path.FormState): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/nfc/queryNcfPage', {
    params: {
      ...data
    }
  })
}
export const nfcAll = async (params?: {
  deviceId: string;
}): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/nfc/queryNcfAll', {
    params: {
      ...params
    }
  })
}
export const addnfc = async (data: NFC.AddNfc): Promise<Service.RequestResult> => {
  return request.post(baseUrl + '/nfc/insert', data
  )
}
export const updatenfc = async (data: NFC.AddNfc): Promise<Service.RequestResult> => {
  return request.put(baseUrl + '/nfc/update', data
  )
}
export const deletenfc = async (id: string): Promise<Service.RequestResult> => {
  return request.delete(baseUrl + `/nfc/delete/${id}`, {
  })
}
export const downloadModule = async (): Promise<Service.RequestResult> => {
  return service.post(baseUrl + '/nfc/download/template', {
  })
}
export const importnfc = async (): Promise<Service.RequestResult> => {
  return service.post(baseUrl + '/nfc/import', {
  })
}
