import axios from "axios";
import type { AxiosRequestConfig, AxiosInstance, AxiosError } from "axios";
import { getNowEnterprise, getToken } from "@/utils/auth";
/**
 * 封装axios请求类
 * @author 蒋衡
 */
export default class CustomAxiosInstance {
  instance: AxiosInstance;

  backendConfig: Service.BackendResultConfig;
  /**
   *
   * @param axiosConfig - axios配置
   * @param backendConfig - 后端返回的数据配置
   */
  constructor(
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
  /** 设置请求拦截器 */
  setInterceptor() {
    this.instance.interceptors.request.use(
      async config => {
        const handleConfig = { ...config };
        if (handleConfig.headers) {
          // 数据转换
          config.timeout = 5000;

          const contentType = handleConfig.headers["Content-Type"] as string;
          handleConfig;
          handleConfig.headers.tenant = getNowEnterprise()?.code;
          handleConfig.headers.terminal = (window as any)?.config?.terminal;
          // 设置token

          handleConfig.headers.Authorization = `Bearer ${
            getToken().access_token
          }`;
        }
        return handleConfig;
      },
      (axiosError: AxiosError) => {
        // const error = handleAxiosError(axiosError);

        // return handleServiceResult(error, null);
        return axiosError;
      },
    );
    // 响应拦截器
    this.instance.interceptors.response.use(
      async response => {
        const { status, data, statusText = '', headers, config } = response

        if (status === 200 || status < 300 || status === 304) {
          const { codeKey, dataKey, successCode } = this.backendConfig
          // 检查是否为标准结构（有code字段）
          if (typeof data === 'object' && data !== null && codeKey in data && dataKey in data) {
            if (data[codeKey] === successCode) {
              return {
                code: data.code,
                data: data.data,
                mes: data.message,
                statusText,
                status,
                headers,
                config
              }
            } else {
              return {
                code: data.code,
                data: data.data,
                mes: data.message,
                statusText,
                status,
                headers,
                config
              }
            }
          } else {
            // 非标准结构，直接返回数据（成功情况下的简化返回）
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
        }
        return {
          code: status,
          data: data,
          mes: statusText || '请求失败',
          statusText,
          status,
          headers,
          config
        }
      },
      (axiosError: AxiosError) => {
        return new Promise((resolve, reject) => {
          reject({
            code: axiosError.response?.status,
            data: axiosError.response?.data,
          });
        });
      },
    );
  }
}
