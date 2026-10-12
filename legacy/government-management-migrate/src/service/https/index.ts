import { getNowEnterprise, getToken } from "@/utils/auth";
import { message } from "ant-design-vue";
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import axios from "axios";
import { mainStore } from "@/store"
/**
 * 封装axios请求类
 * @author 蒋锐
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
          const store = mainStore();
          // 数据转换
          config.timeout = 5000;

          const contentType = handleConfig.headers["Content-Type"] as string;
          handleConfig;
          handleConfig.headers.tenant = getNowEnterprise().code;
          handleConfig.headers.permission = store.permissionId ?? ''
          handleConfig.headers.terminal = (window as any).config.terminal;
          // 设置token

          handleConfig.headers.Authorization = `Bearer ${getToken().access_token
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
        const { status, data } = response;

        if (status === 200 || status < 300 || status === 304) {
          //   const backend = response.data;
          const { codeKey, dataKey, successCode, msgKey } = this.backendConfig;

          if (data[codeKey] === successCode) {
            return {
              code: data.code,
              data: data.data,
              mes: data.message,
            };
          }
          const res = response 
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
        };
      },
      (axiosError: AxiosError) => {
        const { response } = axiosError
        // 处理文件导出
        if (response?.status === 406 && response.config.responseType === 'blob') {
          let fileReader = new FileReader();
          fileReader.onload = function () {
            let jsonData = JSON.parse(this.result as string);  // 说明是普通对象数据，后台转换失败
            message.error(jsonData.message || '请求出现错误')
          };
          fileReader.readAsText(response.data as any)
        } else if (response?.status === 412) {
        } else {
          message.error(response?.statusText)
        }
        return Promise.reject({
          code: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      },
    );
  }
}
