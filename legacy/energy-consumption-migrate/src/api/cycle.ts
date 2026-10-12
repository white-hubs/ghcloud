import { request, service } from '@/service/index'
let baseURL = "/energymanagement";

export const putCycle = async (data:any): Promise<Service.RequestResult> => {
  return request.put(baseURL+`/meter-reade-cycle/${data?.id ? data?.id : data}`,{...data}
 )
}

//抄表定时测略添加
export const setCycle = async (data:any): Promise<Service.RequestResult> => {
  return request.post(baseURL+'/meter-reade-cycle/task',{...data}
 )
}
// 获取抄表周期列表
export const metterReade = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL+'/meter-reade-cycle/one')
}
//抄表周期下拉配置
export const cycleList = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL+'/enumType/getReadingCycleRuleName')
}