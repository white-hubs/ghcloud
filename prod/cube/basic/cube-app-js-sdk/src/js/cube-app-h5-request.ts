import axiosModule, { type AxiosRequestConfig, type AxiosResponse, type AxiosError } from "axios";
import { showNotify } from "vant";

import { getAuthHeaders } from "./cube-h5-config";

export interface RequestReturnType<T = unknown> {
  code: number;
  data: T;
  message: string;
  timestamp: number;
}
/** 创建axios实例 */
const axios = ((axiosModule as typeof axiosModule & { default?: typeof axiosModule }).default ?? axiosModule) as typeof axiosModule;
const instance = axios.create({
  timeout: 300000, // 超时时间
  baseURL: "",
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});
/** 添加请求拦截 */
instance.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const headerConfig = { ...config };
    if (headerConfig.headers) {
      headerConfig.headers = {
        ...headerConfig.headers,
        ...getAuthHeaders(),
      };
    }
    return Promise.resolve(headerConfig);
  },
  async (err) => {
    return Promise.reject(err);
  },
);
/**  响应拦截 */
instance.interceptors.response.use(
  async (response: AxiosResponse) => {
    if ((response.data as { code: number }).code === 200) {
      return Promise.resolve(response);
    }
  },
  async (error: AxiosError) => {
    if (error?.response) {
      switch (error.response.status) {
        case 400:
          error.message = "错误请求";
          break;
        case 401:
          error.message = "未授权，请重新登录";
          break;
        case 403:
          error.message = "拒绝访问";
          break;
        case 404:
          error.message = "请求错误,未找到该资源";
          break;
        case 405:
          error.message = "请求方法未允许";
          break;
        case 408:
          error.message = "请求超时";
          break;
        case 412:
          error.message = "错误请求412";
          break;
        case 500:
          error.message = "服务器端出错";
          break;
        case 501:
          error.message = "网络未实现";
          break;
        case 502:
          error.message = "网络错误";
          break;
        case 503:
          error.message = "服务不可用";
          break;
        case 504:
          error.message = "网络超时";
          break;
        case 505:
          error.message = "http版本不支持该请求";
          break;
        default:
          error.message = `连接错误${error.response.status}`;
      }
    } else {
      error.message = "连接到服务器失败";
    }
    /** 错误逻辑处理，此处可在页面弹框处理 */
    showNotify({ type: "danger", message: error.message });
    return Promise.reject(error.message);
  },
);
async function request<T = unknown>(config: AxiosRequestConfig): Promise<RequestReturnType<T>> {
  const resData = await instance(config);
  return resData.data as RequestReturnType<T>;
}
export default request;
