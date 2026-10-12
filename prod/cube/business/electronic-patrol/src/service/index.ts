import { getNowEnterprise, getToken } from '@/utils/auth'
import axios from 'axios'
import { createRequest } from './request'

export const request = createRequest({ baseURL: '/api' })

export const service = axios.create({
  timeout: 15000, // 请求超时
  baseURL: '/api',
  responseType: 'blob',
  headers: {
    tenant: getNowEnterprise()?.code,
    terminal: window.config?.terminal,
    Authorization: `Bearer ${getToken().accessToken}`,
    'Content-Type': 'application/json',
  },
})
