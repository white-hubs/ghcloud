import axios from 'axios'
import qs from 'qs'
import { Message } from 'element-ui';
import {
  getToken,
  removeToken,
  removeUserInfo,
  removeNowEnterprise,
  getNowEnterprise
} from '@/utils/auth'

const service = axios.create({
  timeout: 15000, // 请求超时
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

//请求拦截
service.interceptors.request.use(
  (config) => {
    config.headers = {
      terminal: "bimops-manage-web",
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
        ...config.headers,
        'Content-Type': 'application/json'
      }
    }
    return config
  },
  (error) => {
    // 请求错误
    if (error.response) {
      const data = error.response.data;
      const errCode = data.code;
      if (errCode) {
        if (errCode === 410) {
          if (sessionStorage.getItem("GH-Token")) {
            confirm({
              title: "提示",
              content:
                "当前账号被其他设备登录，请返回登录页重新登录，如不是本人操作，请尽快修改密码！",
              okText: "确定",
              cancelText: "取消",
              // icon: createVNode(ExclamationCircleOutlined),
              onOk: () => {
                window.location.hash = "/login";
              },
              onCancel: () => {
                window.location.hash = "/login";
              },
            });
          }
          sessionStorage.removeItem("GH-Token");
          sessionStorage.removeItem("GH-NowEnterprise");
          sessionStorage.removeItem("GH-UserInfo");
        } else if (errCode === 409) {
          return { data: data.data, errCode: errCode };
        } else {
          if (errCode === 403) {
            message.error("当前无权限");
            return;
          }
          if (data.data instanceof Object) {
            const obj = data.data;
            for (let i in obj) {
              message.error(obj[i]);
            }
          } else if (data.message) {
            message.error(data.message);
          }
          // message.error(data.message || "请求时出现错误！");
        }
      } else {
        message.error(data.error_description || "请求出现错误");
      }
    }
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
            this.$confirm({
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
        }else if(errCode === 401){
          removeToken()
          removeUserInfo()
          removeNowEnterprise()
          window.location.hash = '/login'
        } else {
          if (errCode === 403) {
            Message.error('当前无权限')
            return
          }
          if (data.data instanceof Object) {
            const obj = data.data
            for (let i in obj) {
              Message.error(obj[i])
            }
          } else if (data.message) {
            Message.error(data.message)
          }
        }
      } else {
        Message.error(data.error_description || '请求出现错误')
      }
    }
    return Promise.reject(error)
  }
)

export default service
