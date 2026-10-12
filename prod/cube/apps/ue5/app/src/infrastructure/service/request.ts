import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";
import type { CubeAuth } from "@ghcloud/cube-protocol";

import { TIMEOUT } from "./config";

export interface requestReturnType<T = any> {
  /**
   * @说明 返回code状态码
   */
  code: number;
  /** 数据内容 */
  content: T;
}
/** 创建axios实例 */
const instance = axios.create({
  timeout: TIMEOUT, // 超时时间
  baseURL: "",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});
/** 添加请求拦截 */
instance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    let authInfo: CubeAuth | null = null;
    try {
      authInfo = CubeMfRootGlobalState.getInstance().mfRootState.authInfo;
    } catch {
      authInfo = null;
    }
    const headerConfig = { ...config };
    if (headerConfig.headers) {
      headerConfig.headers = {
        ...headerConfig.headers,
        // terminal: (window as any).config.terminal,
        terminal: "three-dimensional-visualization",
      };

      if (authInfo?.token) {
        headerConfig.headers.Authorization = `Bearer ${authInfo?.token}`;
        headerConfig.headers["Content-Type"] = "application/json";
      }
      if (authInfo?.tenant) {
        headerConfig.headers.tenant = authInfo?.tenant;
        headerConfig.headers["Content-Type"] = "application/json";
      }
    }
    return Promise.resolve(headerConfig);
  },
  (err) => {
    return Promise.reject(err);
  },
);
/**  响应拦截 */
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.status === 200) {
      return Promise.resolve(response.data);
    }
    if (response.status !== 200) {
      return Promise.resolve(response);
    }
  },
  (error: AxiosError) => {
    if (error && error.response) {
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
    // ...
    if (["/api/ouaa/oauth2/token", "/gw-bff/auth/token"].includes(error.config?.url || "")) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error.message);
  },
);
async function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  let resData = (await instance(config)) as T;

  return resData;
}
export default request;
