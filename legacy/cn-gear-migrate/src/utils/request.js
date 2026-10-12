import axios from 'axios'
import qs from 'qs'
import {
  message,
  Modal
} from 'ant-design-vue'
import {
  getToken,
  removeToken,
  removeUserInfo,
  removeNowEnterprise,
  getNowEnterprise
} from '@/utils/auth'
const confirm = Modal.confirm

const service = axios.create({
  timeout: 60000, // 请求超时
  headers: {
    'Content-Type': 'application/json'
  }
})

//请求拦截
service.interceptors.request.use(
  (config) => {
    if (config.method === 'post' || config.method === 'put') {
      config.data = config.data ? config.data : config.params
      config.params = null
    }
    config.headers = {
      terminal: window.config.terminal,
      ...config.headers
    }
    // 如果参数有tenant,使用参数里的--(一般用于刷新token)
    if (qs.parse(config.data).tenant) {
      config.headers.tenant = qs.parse(config.data).tenant
    } else if (getNowEnterprise()) {
      config.headers.tenant = getNowEnterprise().code
    }
    const token = getToken()
    if (token) {
      config.headers = {
        Authorization: 'Bearer ' + token.access_token,
        'Content-Type': 'application/json',
        ...config.headers,
      }
    }
    return config
  },
  (error) => {
    // 请求错误
    return Promise.reject(error)
  }
)

// 响应拦截
service.interceptors.response.use(
  // 获取响应状态
  (response) => {
    if(response.status === 200){
      const responseData = response.data
      const isStandardApiResponse = responseData && 
        typeof responseData === 'object' && 
        responseData.hasOwnProperty('code') && 
        responseData.hasOwnProperty('data') && 
        typeof responseData.code === 'number' &&
        responseData.code === 200
        if(isStandardApiResponse){
          return responseData.data
        } else {
          return responseData
        }
    } else {
      return response
    }
  },
  (error) => {
    if (error.response) {
      const data = error.response.data
      const errCode = data.code || error.response.status;
      if (errCode) {
        if (errCode === 410) {
          if (getToken()) {
            confirm({
              title: '提示',
              content: '当前账号被其他设备登录，请返回登录页重新登录，如不是本人操作，请尽快修改密码！',
              okText: '确定',
              cancelText: '取消',
              // icon: createVNode(ExclamationCircleOutlined),
              onOk: () => {
                window.location.hash = '/login'
              },
              onCancel: () => {
                window.location.hash = '/login'
              }
            })
          }
          removeToken()
          removeUserInfo()
          removeNowEnterprise()
        } else {
          if (data.data instanceof Object) {
            const obj = data.data
            for (let i in obj) {
              message.error(obj[i])
            }
          } else if (data.message) {
            message.error(data.message)
          }
        }
      } else {
        message.error(data.error_description || '请求出现错误')
      }
    } else {
      const isTimeout = error.code === 'ECONNABORTED' || error.includes('timeout')
      if (isTimeout) message.error('网络超时，请稍后再试')
    }
    return Promise.reject(error)
  }
)

export default service
