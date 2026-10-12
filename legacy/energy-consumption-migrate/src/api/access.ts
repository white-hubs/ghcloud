import { request } from '@/service/index'
import type { LocationQueryValue } from 'vue-router'
let baseURL = "/energymanagement";
enum URL {
  MeterType=`/enumType/getInstumenttype`,
  ProjectPage=`/energy-project/page`
}

export const meterType = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL+URL.MeterType)
}
export const getproject = async (id: string): Promise<Service.RequestResult> => {
  return request.get(baseURL+'/energy-project/'+id)
}
export const deleteproject = async (id: string): Promise<Service.RequestResult> => {
  return request.delete(baseURL+'/energy-project/'+id)
}
export const getDviceAreaArr = async (type: LocationQueryValue | LocationQueryValue[]): Promise<Service.RequestResult> => {
  return request.get('/energymanagement/meter-device/device-area/'+type)
}
export const projectgape = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL+URL.ProjectPage,{
  params:{
  ...params}
  })
}
export const addproject = async (params: any): Promise<Service.RequestResult> => {
  return request.post(baseURL+'/energy-project',{
    ...params
  })
}
export const putproject = async (params: any,id: string): Promise<Service.RequestResult> => {
  return request.put(baseURL+'/energy-project/'+id,{
    ...params
  })
}
export const areaList = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL+'/area-list')
}