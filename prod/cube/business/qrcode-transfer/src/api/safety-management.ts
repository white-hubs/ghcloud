import request from '@/utils/request'
const baseURL = '/api/safety-management/'
// 风险源列表
export const getRiskSourcePage = async (params?: Record<string, string | number | boolean>): Promise<any> => {
  return request({
    url: baseURL + 'property/propertyTypePage',
    params,
    method: 'GET',
  })
}
