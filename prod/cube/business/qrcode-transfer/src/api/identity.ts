import request from '@/utils/request'
const baseURL = '/api/identity/'
// 获取应用信息
export const getApplicationLink = async (params?: Record<string, string | number>): Promise<any> => {
  return request({
    url: baseURL + 'qrcode/scan/entityAndApplication',
    method: 'GET',
    params,
  })
}
// 基础数据统计
export const getDeviceBasicStatistic = async (params?: Record<string, string | number>): Promise<any> => {
  return request({
    url: baseURL + 'basic-data-report-analysis',
    method: 'GET',
    params,
  })
}
export const getPublicTenant = async (params?: Record<string, string | number>): Promise<unknown> =>
  request({
    url: baseURL + 'public/qrcode/scan/get/tenant',
    method: 'GET',
    params
  })
