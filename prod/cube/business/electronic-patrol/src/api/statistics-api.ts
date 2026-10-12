import { request, service } from '@/service/index'
const baseUrl = '/maintain'

export const getlocation = async (params: Statistics.FormState): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/electron/statistics/location', { params: { ...params } })
}
export const getpersonnel = async (params: Statistics.FormState): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/electron/statistics/personnel', { params: { ...params } })
}
export const getlocationExport = async (params: Statistics.FormState): Promise<Service.RequestResult> => {
  return service.get(baseUrl + '/electron/statistics/locationExport', { params: { ...params } })
}
export const getpersonnelExport = async (params: Statistics.FormState): Promise<Service.RequestResult> => {
  return service.get(baseUrl + '/electron/statistics/personnelExport', { params: { ...params } })
}
