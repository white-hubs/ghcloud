import { request } from '@/service/index'
let baseURL = "/energymanagement";

export const areapage = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL+'/route-project/tree',{
  params:{
  ...params}
  })
}
export const deletepage = async (id: string): Promise<Service.RequestResult> => {
  return request.delete(baseURL+'/route-project/'+id,{
  })
}
export const getpage = async (id: string): Promise<Service.RequestResult> => {
  return request.get(baseURL+'/route-project/'+id,{
  })
}
export const addpage = async (params: any): Promise<Service.RequestResult> => {
  params.routeName=params.projectName
  params.projectName=undefined
  return request.post(baseURL+'/route-project',{

  ...params}
  )
}
export const putpage = async (params: any,id: string): Promise<Service.RequestResult> => {
  params.routeName=params.projectName
  params.projectName=undefined
  return request.put(baseURL+'/route-project/'+id,{
  ...params}
  )
}