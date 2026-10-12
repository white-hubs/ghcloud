import { getNowEnterprise, getToken } from '@/utils/auth'
import { message } from 'ant-design-vue'
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'
export default class CustomAxiosInstance {
  public readonly instance: AxiosInstance

  private readonly backendConfig: Service.BackendResultConfig
  /**
   *
   * @param axiosConfig - axios配置
   * @param backendConfig - 后端返回的数据配置
   */
  public constructor (
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
  private setInterceptor () {
    this.instance.interceptors.request.use(
      async config => {
        const handleConfig = { ...config }
        if (handleConfig.headers) {
          // 数据转换
          config.timeout = 5000

          handleConfig.headers.tenant = getNowEnterprise().code
          handleConfig.headers.terminal = window.config.terminal
          handleConfig.headers.tenantFlag='interior'
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
          const res = data?.data ? data : response
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
        if (axiosError.response?.data) {
          const responseData = axiosError.response.data as { code: number; message: string; data:{areaName:string}}
          message.error(responseData?.data?.areaName||responseData.message || '请求出现错误')
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
