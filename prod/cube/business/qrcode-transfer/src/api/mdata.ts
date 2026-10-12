import request from '@/utils/request'
const baseURL = '/api/mdata/'

// 档位详情
export const getStallDetail = async (id: number): Promise<any> => {
  return request({
    url: baseURL + `stall/${id}`,
    method: 'GET',
  })
}
