import { createRequest } from '@/service/request'

const request = createRequest({ baseURL: '/api' })

enum URL {
  GET_CURRENT_USER = '/system/user/getCurrentUser'
}

/**
 * 获取当前登录用户信息
 * TODO(danke): szgd 老项目与新项目均有 `code:200 = success`，遂临时借用 `request` 统一处理
 *
 * @returns 通用返回
 */
export const getCurrentUser = async (): Promise<Service.RequestResult> => {
  const token = document.cookie.match(/;?vue_admin_template_token=(?<value>[^;]+)/)?.groups?.value
  if (!token) {
    throw new Error('auth fail!')
  }
  return request.get(URL.GET_CURRENT_USER, {
    headers: {
      authorization: decodeURIComponent(token)
    }
  })
}
