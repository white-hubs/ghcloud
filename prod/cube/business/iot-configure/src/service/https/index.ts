import { getTenant, getToken, setTenant, setToken } from '@/tools'
import { message } from '@ghcloud/cube-ui'
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
          handleConfig.headers['Content-Type'] = 'application/json'
          // 数据转换
          config.timeout = 5000
          handleConfig.headers.tenant = `${getTenant()}`
          // 设置token
          handleConfig.headers.token = `${getToken()}`
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

          return {

            code: status,

            data: data.data,

            mes: data.msg,

          }

          //   const error = handleBackendError(backend, this.backendConfig);
        }

        // const error = handleResponseError(response);
        return {

          code: status,

          data: data.data,

          mes: data.msg,
        }
      },
      async (axiosError: AxiosError) => {
        if (axiosError.response?.status === 401) {
          setTenant('')
          setToken('')
          setTimeout(() => {
            window.location.reload()
          }, 3000)
        }
        if (axiosError.response?.data) {
          if (axiosError?.config?.url?.includes('/headDetail')) return
          const responseData = axiosError.response.data as { code: number; msg: string; }
          message.error(responseData.msg || '请求出现错误')
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
