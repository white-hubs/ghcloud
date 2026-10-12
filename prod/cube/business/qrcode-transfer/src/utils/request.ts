import qs from 'qs'
import axios from 'axios'
import { showDialog, showNotify } from 'vant'

import { authStore } from '@/api/auth-store'
const service = axios.create({
  timeout: 15000, // 请求超时
  baseURL: '',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

// 请求拦截
service.interceptors.request.use(
  (config) => {
    config.headers = {
      terminal: authStore.terminal,
      ...config.headers
    }
    // 如果参数有tenant,使用参数里的--(一般用于刷新token)
    if (qs.parse(config.data).tenant) {
      config.headers.tenant = qs.parse(config.data).tenant as string
    } else if (sessionStorage.getItem('GH-NowEnterprise')) {
      config.headers.tenant = (JSON.parse(sessionStorage.getItem('GH-NowEnterprise') as unknown as string) as { 'code': string; })?.code ?? ''
    }
    const token = JSON.parse((sessionStorage.getItem('GH-Token')!))
    if (token?.access_token) {
      config.headers = {
        Authorization: token.access_token.includes('Bearer') ? token.access_token : ('Bearer ' + token.access_token),
        ...config.headers,
        'Content-Type': 'application/json'
      }
    }
    return config
  },
  async (error) => {
    // 请求错误
    if (error.response) {
      const data = error.response.data
      const errCode = data.code
      if (errCode) {
        if (errCode === 410) {
          if (sessionStorage.getItem('GH-Token')) {
            showDialog({
              title: '提示',
              message: '当前账号被其他设备登录，请返回登录页重新登录，如不是本人操作，请尽快修改密码！',
            })
          }
          sessionStorage.removeItem('GH-Token')
          // sessionStorage.removeItem('GH-NowEnterprise')
          sessionStorage.removeItem('GH-UserInfo')
        } else if (errCode === 409) {
          return { data: data.data, errCode }
        } else {
          if (errCode === 403) {
            showNotify({ type: 'danger', message: '当前无权限' })
            return
          }
          if (data.data instanceof Object) {
            const obj = data.data
            for (const i in obj) {
              showNotify({ type: 'danger', message: obj[i] })
            }
          } else if (data.message) {
            showNotify({ type: 'danger', message: data.message })
          }
          showNotify({ type: 'danger', message: '请求时出现错误！' })
        }
      } else {
        showNotify({ type: 'danger', message: data?.error_description ?? '请求出现错误' })
      }
    }
    return Promise.reject(error)
  }
)

// 响应拦截
service.interceptors.response.use(
  // 获取响应状态
  (response) => {
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
  async (error) => {
    if (error.response) {
      const data = error.response.data
      const errCode = data.code
      if (errCode) {
        if (errCode === 410) {
          if (JSON.parse((sessionStorage.getItem('GH-Token')!))) {
            showDialog({
              title: '提示',
              message: '当前账号被其他设备登录，请返回登录页重新登录，如不是本人操作，请尽快修改密码！',
            }).then(() => {
            })
          }
          sessionStorage.removeItem('GH-Token')
          sessionStorage.removeItem('GH-UserInfo')
          // sessionStorage.removeItem('GH-NowEnterprise')
        } else if (errCode === 401) {
          sessionStorage.removeItem('GH-Token')
          sessionStorage.removeItem('GH-UserInfo')
          // sessionStorage.removeItem('GH-NowEnterprise')
        } else if (errCode === 409) {
          return {
            data: data.data,
            errCode
          }
        } else {
          if (errCode === 403) {
            showNotify({ type: 'danger', message: '当前无权限' })
            return
          }
          if (data.data instanceof Object) {
            const obj = data.data
            for (const i in obj) {
              showNotify({ type: 'danger', message: obj[i] })
            }
          } else if (data.message) {
            showNotify({ type: 'danger', message: data.message })
          }
        }
      } else {
        showNotify({ type: 'danger', message: data?.error_description ?? '请求出现错误' })
      }
    }
    return Promise.reject(error)
  }
)

export default service
