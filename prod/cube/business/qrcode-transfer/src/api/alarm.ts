import request from '@/utils/request'
const baseURL = '/api/alarm/'
// 报警数
export const getAlarmNum = async (params?: Record<string, string>): Promise<any> => {
  return request({
    url: baseURL + 'alarm-statistics',
    params,
    method: 'GET',
  })
}
