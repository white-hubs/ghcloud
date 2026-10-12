import { getNowEnterprise, getToken } from "@/utils/auth";
import { message } from 'ant-design-vue';
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";

export default class CustomAxiosInstance {
  instance: AxiosInstance;

  backendConfig: Service.BackendResultConfig;
  /**
   *
   * @param axiosConfig - axios配置
   * @param backendConfig - 后端返回的数据配置
   */
  public constructor(
    axiosConfig: AxiosRequestConfig,
    backendConfig: Service.BackendResultConfig = {
      codeKey: "code",
      dataKey: "data",
      msgKey: "message",
      successCode: 200,
    },
  ) {
    this.backendConfig = backendConfig;
    this.instance = axios.create(axiosConfig);
    this.setInterceptor();
  }

  private setInterceptor() {
    this.instance.interceptors.request.use(this.requestOnFulfilled.bind(this), this.requestOnRejected.bind(this));
    // 响应拦截器
    this.instance.interceptors.response.use(this.responseOnFulfilled.bind(this),this.responseOnRejected.bind(this));
  }

  private async requestOnFulfilled(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    return {
      ...config,
      timeout: 5000,
      headers: {
        ...config?.headers,
        tenant: getNowEnterprise().code,
        terminal: (window as any).config.terminal,
        Authorization: `Bearer ${getToken().access_token}`
      }
    };
  }

  private async requestOnRejected(axiosError: AxiosError): Promise<AxiosError> {
    return axiosError;
  }

  private async responseOnFulfilled(response: AxiosResponse): Promise<AxiosResponse & { code?: unknown, message?: string } | Blob> {
    const { status, data, statusText = '', headers, config } = response
    if (status !== 200 && status >= 300 && status !== 304) {
      return {
        code: status,
        data,
        message: statusText || '请求失败',
        statusText,
        status,
        headers,
        config
      }
    }
    const { codeKey, dataKey } = this.backendConfig
    if (data instanceof Blob) {
      return data;
    }
    if (data instanceof Object &&data.hasOwnProperty(codeKey) && data.hasOwnProperty(dataKey)) {
      return {
        code: data.code,
        data: data.data,
        message: data.message,
        statusText,
        status,
        headers,
        config
      }
    }
    return {
      code: 200,
      data: data,
      message: 'success',
      statusText,
      status,
      headers,
      config
    }
  }

  private async responseOnRejected(axiosError: AxiosError | any): Promise<AxiosError> {
    const { response } = axiosError;
    if (response?.data) {
      if (Object.prototype.toString.call(response.data) === '[object Blob]') {  // 先判断是不是blob格式
        if (response.data.type.includes('application/json')) {  // 判断是不是特殊情况(json)
          let reader = new FileReader()
          reader.onload = function () {
            let res = reader.result
            let result = JSON.parse(res as string) // blob格式转成json
            message.error(result.message)
          }
          reader.readAsText(response.data)
          return Promise.reject(axiosError);
        }
      }

      message.error(response?.data.message)
    } else {
      message.error(response?.statusText)
    }

    return Promise.reject(axiosError);
  }
}
