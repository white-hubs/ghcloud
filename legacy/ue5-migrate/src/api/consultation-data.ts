import request from "../service/request";
const baseURL = '/api/securitymanagement'
type consultationType={
  appointmentNum:number,
  signNum:number|null,
  subject:string,
  timeFlag:string,
  visitNum:number,
  waitingNum:number,
}
type distributionType={
  distributionAppointmentVisit:any[],
  total:number
}

//看诊数据
export function consultationData<T extends Record<string,any>>(params: T){
  return request<consultationType>({
    url:`${baseURL}/consultation-data`,
    method:"GET",
    params
})
}
//接诊趋势
export function receptionTrends<T extends Record<string,any>>(params: T){
  return request<{receptionTrends:any[],xtitle:string[]  }>({
    url:`${baseURL}/reception-trends`,
    method:"GET",
    params
})
}
//候诊情况
export function waitingSituation<T extends Record<string,any>>(params: T){
  return request<any[]>({
    url:`${baseURL}/waiting-situation`,
    method:"GET",
    params
})
}
//预约就诊分布
export function distributionAppointmentVisits<T extends Record<string,any>>(params: T){
  return request<distributionType>({
    url:`${baseURL}/distribution-appointment-visits`,
    method:"GET",
    params
})
}