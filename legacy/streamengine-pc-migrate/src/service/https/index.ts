import axios from "axios";
import type { AxiosRequestConfig, AxiosInstance, AxiosError } from "axios";
import { getNowEnterprise, getToken } from "@/utils/auth";
import { message } from "ant-design-vue";
import { useApproval } from "@/store";
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
    }
  ) {
    this.backendConfig = backendConfig;
    this.instance = axios.create(axiosConfig);
    this.setInterceptor();
  }
  /** 设置请求拦截器 */
  setInterceptor() {
    this.instance.interceptors.request.use(
      async (config) => {
        const handleConfig = { ...config };
        if (handleConfig.headers) {
          const store = useApproval();
          // 数据转换
          config.timeout = 5000;

          const contentType = handleConfig.headers["Content-Type"] as string;
          handleConfig;
          handleConfig.headers.tenant = getNowEnterprise().code;
          handleConfig.headers.terminal = (window as any).config.terminal;
          handleConfig.headers.permission = store.permissionId ?? "";
          // 设置token

          handleConfig.headers.Authorization = `Bearer ${
            getToken().access_token
          }`;
        }
        return handleConfig;
      },
      (axiosError: AxiosError) => {
        return axiosError;
      }
    );
    // 响应拦截器
    this.instance.interceptors.response.use(
      async (response) => {
        const { status, data } = response;
        const resCode = data.code || false;
        if (resCode === 200) {
          const result = data.data || true;
          return result;
        } else {
          return data;
        }
      },
      (axiosError: AxiosError) => {
        //@ts-ignore
        message.error(axiosError.response?.data?.message || "请求出现错误");
        return Promise.reject(axiosError);
      }
    );
  }
}
