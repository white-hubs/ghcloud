import { createRequest } from './request'
import { getNowEnterprise, getToken } from '@/utils/auth'
import axios from 'axios'

export const request = createRequest({ baseURL: '/api' })

export const service = axios.create({
  timeout: 1500000, // 请求超时
  baseURL: '/api',
  responseType: 'blob',
  headers: {
    tenant: getNowEnterprise()?.code,
    terminal: (window as any).config.terminal,
    Authorization: `Bearer ${getToken().access_token}`,
    'Content-Type': 'application/json',
  },
})
