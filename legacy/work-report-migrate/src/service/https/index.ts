import { getNowEnterprise, getToken } from '@/utils/auth'
import { message } from 'ant-design-vue'
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'
/**
 * 封装axios请求类
 * @author 蒋锐
 */
export default class CustomAxiosInstance {
  instance: AxiosInstance

  backendConfig: Service.BackendResultConfig
  /**
   *
   * @param axiosConfig - axios配置
   * @param backendConfig - 后端返回的数据配置
   */
  constructor (
    axiosConfig: AxiosRequestConfig,
    backendConfig: Service.BackendResultConfig = {
      codeKey: 'code',
      dataKey: 'data',
      msgKey: 'message',
      successCode: 200,
    },
  ) {
    this.backendConfig = backendConfig
    this.instance = axios.create(axiosConfig)
    this.setInterceptor()
  }

  /** 设置请求拦截器 */
  setInterceptor (): void {
    this.instance.interceptors.request.use(
      async config => {
        const handleConfig = { ...config }
        if (handleConfig.headers) {
          // 数据转换
          config.timeout = 5000
          handleConfig.headers.tenant = getNowEnterprise().code
          handleConfig.headers.terminal = (window as any).config.terminal
          // 设置token
          handleConfig.headers.Authorization = `Bearer ${getToken().access_token}`
        }
        return handleConfig
      },
      (axiosError: AxiosError) => {
        // const error = handleAxiosError(axiosError);

        // return handleServiceResult(error, null);
        return axiosError
      },
    )
    // 响应拦截器
    this.instance.interceptors.response.use(
      async response => {
        const { status, data } = response

        if (status === 200 || status < 300 || status === 304) {
          //   const backend = response.data;
          const { codeKey, successCode } = this.backendConfig

          if (data[codeKey] === successCode) {
            return {
              code: data.code,
              data: data.data,
              mes: data.message,
            }
          }
          const res = data?.data ? data?.data : data
          if (Object.prototype.toString.call(res.data) === '[object Blob]') {
            return data
          } else {
            return res
          }
        }

        // const error = handleResponseError(response);
        return {
          code: data.code,
          data: data.data,
          mes: data.message,
        }
      },
      async (axiosError: AxiosError) => {
        const { response } = axiosError
        // 处理文件导出
        if (response?.status === 406 && response.config.responseType === 'blob') {
          const fileReader = new FileReader()
          fileReader.onload = function () {
            const jsonData = JSON.parse(this.result as string) // 说明是普通对象数据，后台转换失败
            message.error(jsonData.message || '请求出现错误')
          }
          fileReader.readAsText(response.data as any)
        } else if (response?.status === 412) {
        } else if (response?.status === 406) {
          message.error((response.data as { message: string; }).message)
        } else {
          message.error(response?.statusText)
        }
        return new Promise((_resolve, reject) => {
          reject({
            code: axiosError.response?.status,
            data: axiosError.response?.data,
          })
        })
      },
    )
  }
}
