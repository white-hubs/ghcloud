import { getNowEnterprise, getToken } from './utils/auth.ts'
import axios, { type AxiosRequestConfig } from 'axios'
import { createRequest } from './service/request/index.ts'
import type { BaseAPIResult } from './service/types.ts'
import { authStore } from './utils/auth-store.ts'
const request = createRequest({ baseURL: '/api' })

const service = axios.create({
  timeout: 30000, // 请求超时
  baseURL: '/api',
  responseType: 'blob',
  headers: {
    'Content-Type': 'application/json',
  },
})

const auth = authStore.tenant && authStore.token
  ? authStore
  : {
      tenant: getNowEnterprise().code,
      terminal: (window as any).config && window.config.terminal ? window.config.terminal : 'bimops-manage-web',
      token: `Bearer ${getToken().accessToken}`
    }

service.interceptors.request.use(
  async config => {
    const handleConfig = { ...config }
    if (handleConfig.headers) {
      // 数据转换
      config.timeout = 5000

      handleConfig.headers.tenant = auth.tenant

      handleConfig.headers.terminal = auth.terminal
      // 设置token
      handleConfig.headers.Authorization = `${auth.token}`
    }
    return handleConfig
  },

)

const Get = async <T=unknown>(url: string, config?: AxiosRequestConfig): Promise<BaseAPIResult<T>> => {
  return request.get<T>(url, config)
}
const Post = async <T=unknown>(url: string, data: unknown, config?: AxiosRequestConfig): Promise<BaseAPIResult<T>> => {
  return request.post<T>(url, data, config)
}
const Put = async <T=unknown>(url: string, data: unknown, config?: AxiosRequestConfig): Promise<BaseAPIResult<T>> => {
  return request.put<T>(url, data, config)
}
const Delete = async <T=unknown>(url: string, config?: AxiosRequestConfig): Promise<BaseAPIResult<T>> => {
  return request.delete<T>(url, config)
}

export {
  request,
  service,
  type BaseAPIResult,
  createRequest,
  Get,
  Post,
  Put,
  Delete
}
