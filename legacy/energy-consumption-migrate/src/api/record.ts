import { request } from '@/service/index'
import type { LocationQueryValue } from 'vue-router'

let baseURL = "/energymanagement";

export const getAreaList = async (params: {}): Promise<Service.RequestResult> => {
  return request.get(baseURL+'/area-list',{
  params:{
  
  ...params
  }})
}
export const metterDevice = async (params: { deviceAreaId: string; pageNumber: number; pageSize: number; period: string; total: number }): Promise<Service.RequestResult> => {
  return request.get(baseURL+'/meter-device/getReadeList',{
  params:{
  
  ...params
  }})
}
export const meterReading = async (params: {}): Promise<Service.RequestResult> => {
  return request.get(baseURL+'/manual-meter-reading',{
  params:{
  ...params}})
}
export const deviceDetail = async (id:LocationQueryValue | LocationQueryValue[],): Promise<Service.RequestResult> => {
  return request.get(baseURL+`/meter-device/${id}`)
}
export const meterStatistics = async (params: {
  deviceId:string 
  instrumentType:string 
  timeFlag:string 
  period:string 
}): Promise<Service.RequestResult> => {
  return request.get(baseURL+`/quantity-meter-statistics`,{
    params:{
    ...params
    }
  })
}
export const totalUsage = async (params: {
  deviceId:string 
  instrumentType:string 
  timeFlag:string 
   period:string 
  

}): Promise<Service.RequestResult> => {
  return request.get(baseURL+`/total-usage`,{
    params:{
    ...params
    }
  })
}
export const energyUsage = async (params: {
  deviceId:string 
  instrumentType:string 
  timeFlag:string 
  period:string 
  propCode:string
}): Promise<Service.RequestResult> => {
  return request.get(baseURL+`/energy-usage`,{ params})
}