import axios from 'axios'
import { createRequest } from './request'
import { getToken } from '@/tools'

export const request = createRequest({ baseURL: '/api' })

export const service = axios.create({
  timeout: 15000, // 请求超时
  baseURL: '/api',
  responseType: 'blob',
  headers: {

    token: `${getToken()}`,
    'Content-Type': 'application/json',
  },
})
