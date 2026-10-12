import request from '@/utils/request'
const baseURL = '/api/maintain/'

// 现场点详情
export const getInspectDetail = async (id: number): Promise<any> => {
  return request({
    url: baseURL + `inspect/detail/${id}`,
    method: 'GET',
  })
}
// 巡更点详情
export const getPatrolDetail = async (id: number): Promise<any> => {
  return request({
    url: baseURL + `patrol/location/${id}`,
    method: 'GET',
  })
}
// 巡检次数
export const getInspectNum = async (params?: Record<string, string>): Promise<any> => {
  return request({
    url: baseURL + 'inspect-record/objInspectNum',
    params,
    method: 'GET',
  })
}
// 整改次数
export const getHiddenDangerNum = async (params?: Record<string, string>): Promise<any> => {
  return request({
    url: baseURL + 'hidden/order/statistic',
    params,
    method: 'GET',
  })
}
// 报修次数
export const getFaultNum = async (params?: Record<string, string>): Promise<any> => {
  return request({
    url: baseURL + 'fault/order/statistic',
    params,
    method: 'GET',
  })
}
// 电子巡更任务数
export const electronTaskOverview = async (params?: Record<string, string | number | boolean>): Promise<any> => {
  return request({
    url: baseURL + 'electron/task/overview',
    params,
    method: 'GET',
  })
}
