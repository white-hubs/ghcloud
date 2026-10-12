import axios from 'axios'
import { createRequest } from './request'
import { getNowEnterprise, getToken } from '@/utils/auth'
export const request = createRequest({ baseURL: '/api' })

export const service = axios.create({
  timeout: 15000, // 请求超时
  baseURL: '/',
  responseType: 'blob',
  headers: {
    'Authorization': `Bearer ${getToken().access_token}`,
    'tenant':getNowEnterprise().code,
    'terminal':(window as any).config.terminal,
    'tenantFlag': 'interior',
    'Content-Type': 'application/json',
  },
})
