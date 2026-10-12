import { request, service } from '@/service/index'
import { SelectValue } from 'ant-design-vue/lib/select'
let baseURL = "/energymanagement";

export const areapage = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL+'/area-project/tree',{
  params:{
  ...params}
  })
}
export const deletepage = async (id: string): Promise<Service.RequestResult> => {
  return request.delete(baseURL+'/area-project/'+id,{
  })
}
export const getpage = async (id: string): Promise<Service.RequestResult> => {
  return request.get(baseURL+'/area-project/'+id,{
  })
}
export const addpage = async (params: any): Promise<Service.RequestResult> => {
  params.areaName=params.projectName
  params.projectName=undefined
  return request.post(baseURL+'/area-project',{

  ...params}
  )
}
export const putpage = async (params: any,id: string): Promise<Service.RequestResult> => {
  params.areaName=params.projectName
  params.projectName=undefined
  return request.put(baseURL+'/area-project/'+id,{
  ...params}
  )
}