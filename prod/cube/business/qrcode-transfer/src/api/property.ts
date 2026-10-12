import request from '@/utils/request'
const baseURL = '/api/property/'

// 风险详情
export const getRiskDetail = async (id: number): Promise<any> => {
  return request({
    url: baseURL + `risk/source/ledger/queryById/${id}`,
    method: 'GET',
  })
}
// 盘点次数
export const getTaskByPropertyIdNum = async (params?: Record<string, string>): Promise<any> => {
  return request({
    url: baseURL + 'property/check/task/queryTaskByPropertyIdPage',
    params,
    method: 'GET',
  })
}
// 风险源数
export const getRiskSourceNum = async (params?: Record<string, string>): Promise<any> => {
  return request({
    url: baseURL + 'risk/source/ledger/page',
    params,
    method: 'GET',
  })
}
// 资产详情
export const getPropertyDetail = async (id: number): Promise<any> => {
  return request({
    url: baseURL + `property/detailed/${id}`,
    method: 'GET',
  })
}
