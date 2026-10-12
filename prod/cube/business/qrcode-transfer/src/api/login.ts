import request from '@/utils/request'
const baseURL = '/api/ouaa'
// 登录
export const login = async (data: unknown): Promise<unknown> => {
  return request({
    url: '/gw-bff/auth/token',
    method: 'post',
    data
  })
}
// 我的企业 - 查询
export const getTenant = async (params?: any, method = 'get'): Promise<unknown> =>
  request({
    url: '/api/mdata/tenant/mine',
    method,
    params
  })
