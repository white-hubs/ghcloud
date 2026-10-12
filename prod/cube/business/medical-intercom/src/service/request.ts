import axios, { type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'
import { message } from '@ghcloud/cube-ui'
import { TIMEOUT } from './config'
import { getNowEnterprise, getToken } from '../utils/auth'

type RequestErrorType = 'axios' | 'http' | 'backend'
export interface BaseAPIResult<T=unknown> {
  error: { type: RequestErrorType; code: string | number; msg: string; } | null;
  code: number;
  data: T;
  message: string;
  timestamp: number;
}

/** 创建axios实例 */
const instance = axios.create({
  timeout: TIMEOUT, // 超时时间
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
})
/** 添加请求拦截 */
instance.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const headerConfig = { ...config }
    if (headerConfig.headers) {
      headerConfig.headers = {
        ...headerConfig.headers,
        Authorization: `Bearer ${getToken().access_token}`,
        terminal: window.config.terminal,
        tenant: getNowEnterprise().code,
        'Content-Type': 'application/json'
      }
    }
    return Promise.resolve(headerConfig)
  },
  async (err) => {
    return Promise.reject(err)
  }
)
/**  响应拦截 */
instance.interceptors.response.use(
  async (response: AxiosResponse) => {
    if (response.status === 200){
      const responseData = response.data
      const isStandardApiResponse = responseData &&
        typeof responseData === 'object' &&
        responseData.hasOwnProperty('code') &&
        responseData.hasOwnProperty('data') &&
        typeof responseData.code === 'number' &&
        responseData.code === 200
      if (isStandardApiResponse){
        return responseData.data
      } else {
        return responseData
      }
    } else {
      return response
    }
  },
  async (error: AxiosError) => {
    if (error?.response) {
      const isTimeout = error.code === 'ECONNABORTED' && error.message.includes('timeout')
      if (isTimeout) message.error('网络超时，请稍后再试')
      if (error.response.status === 404) message.error(`${error.response.statusText}`)
    }
    message.error(error.message)
    return Promise.reject(error.message)
  }
)
async function request<T = BaseAPIResult> (config: AxiosRequestConfig): Promise<T> {
  const resData = await instance(config) as { data: T; }
  return resData.data
}
export default request
