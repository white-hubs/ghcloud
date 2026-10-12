import request from '@/utils/request'
const baseURL = '/api/device-center/'

// 设备详情
export const getDeviceDetail = async (id: number): Promise<any> => {
  return request({
    url: baseURL + `device/${id}`,
    method: 'GET',
  })
}
