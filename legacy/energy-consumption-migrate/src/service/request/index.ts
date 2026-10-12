import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import type { Ref } from 'vue'
import { ref } from 'vue'

import CustomAxiosInstance from '../https/index'

type RequestMethod = 'get' | 'post' | 'put' | 'delete'

interface RequestParam {
  url: string;
  method?: RequestMethod;
  data?: unknown;
  axiosConfig: AxiosRequestConfig | undefined;
}

interface CreateRequestResponse {
  get: <T>(url: string, config?: AxiosRequestConfig) => Promise<Service.RequestResult<T>>;
  post: <T>(url: string, data: unknown, config?: AxiosRequestConfig) => Promise<Service.RequestResult<T>>;
  put: <T>(url: string, data: unknown, config?: AxiosRequestConfig) => Promise<Service.RequestResult<T>>;
  delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<Service.RequestResult<T>>;
}

/**
 * 创建请求
 * @param axiosConfig - axios配置
 * @param backendConfig - 后端接口字段配置
 */
export function createRequest (
  axiosConfig: AxiosRequestConfig,
  backendConfig?: Service.BackendResultConfig,
): CreateRequestResponse {
  const customInstance = new CustomAxiosInstance(axiosConfig, backendConfig)

  /**
   * 异步promise请求
   * @param param - 请求参数
   * - url: 请求地址
   * - method: 请求方法(默认get)
   * - data: 请求的body的data
   * - axiosConfig: axios配置
   */
  async function asyncRequest<T> (
    param: RequestParam,
  ): Promise<Service.RequestResult<T>> {
    const { url } = param
    const method = param.method ?? 'get'
    const { instance } = customInstance
    const res = (await getRequestResponse(
      instance,
      method,
      url,
      param.data,
      param.axiosConfig,
    )) as Service.RequestResult<T>

    return res
  }

  /**
   * get请求
   * @param url - 请求地址
   * @param config - axios配置
   */
  async function get<T> (url: string, config?: AxiosRequestConfig): Promise<Service.RequestResult<T>> {
    return asyncRequest<T>({ url, method: 'get', axiosConfig: config })
  }

  /**
   * post请求
   * @param url - 请求地址
   * @param data - 请求的body的data
   * @param config - axios配置
   */
  async function post<T> (url: string, data?: unknown, config?: AxiosRequestConfig): Promise<Service.RequestResult<T>> {
    return asyncRequest<T>({ url, method: 'post', data, axiosConfig: config })
  }

  /**
   * put请求
   * @param url - 请求地址
   * @param data - 请求的body的data
   * @param config - axios配置
   */
  async function put<T> (url: string, data?: unknown, config?: AxiosRequestConfig): Promise<Service.RequestResult<T>> {
    return asyncRequest<T>({ url, method: 'put', data, axiosConfig: config })
  }

  /**
   * delete请求
   * @param url - 请求地址
   * @param config - axios配置
   */
  async function handleDelete<T> (url: string, config?: AxiosRequestConfig): Promise<Service.RequestResult<T>> {
    return asyncRequest<T>({ url, method: 'delete', axiosConfig: config })
  }

  return {
    get,
    post,
    put,
    delete: handleDelete,
  }
}

interface RequestResultHook<T = unknown> {
  data: Ref<T | null>;
  error: Ref<Service.RequestError | null>;
  //   loading: Ref<boolean>;
  //   network: Ref<boolean>;
}

/**
 * 创建hooks请求
 * @param axiosConfig - axios配置
 * @param backendConfig - 后端接口字段配置
 */
export function createHookRequest (
  axiosConfig: AxiosRequestConfig,
  backendConfig?: Service.BackendResultConfig,
): unknown {
  const customInstance = new CustomAxiosInstance(axiosConfig, backendConfig)

  /**
   * hooks请求
   * @param param - 请求参数
   * - url: 请求地址
   * - method: 请求方法(默认get)
   * - data: 请求的body的data
   * - axiosConfig: axios配置
   */
  function useRequest<T> (param: RequestParam): RequestResultHook<T> {
    const data = ref<T | null>(null) as Ref<T | null>
    const error = ref<Service.RequestError | null>(null)

    function handleRequestResult (response: unknown): void {
      const res = response as Service.RequestResult<T>
      data.value = res.data
      error.value = res.error
    }

    const { url } = param
    const method = param.method ?? 'get'
    const { instance } = customInstance

    getRequestResponse(
      instance,
      method,
      url,
      param.data,
      param.axiosConfig,
    ).then(handleRequestResult)

    return {
      data,
      error,
    }
  }

  /**
   * get请求
   * @param url - 请求地址
   * @param config - axios配置
   */
  async function get<T> (url: string, config?: AxiosRequestConfig): Promise<RequestResultHook<T>> {
    return useRequest<T>({ url, method: 'get', axiosConfig: config })
  }

  /**
   * post请求
   * @param url - 请求地址
   * @param data - 请求的body的data
   * @param config - axios配置
   */
  async function post<T> (url: string, data?: unknown, config?: AxiosRequestConfig): Promise<RequestResultHook<T>> {
    return useRequest<T>({ url, method: 'post', data, axiosConfig: config })
  }
  /**
   * put请求
   * @param url - 请求地址
   * @param data - 请求的body的data
   * @param config - axios配置
   */
  async function put<T> (url: string, data?: unknown, config?: AxiosRequestConfig): Promise<RequestResultHook<T>> {
    return useRequest<T>({ url, method: 'put', data, axiosConfig: config })
  }

  /**
   * delete请求
   * @param url - 请求地址
   * @param config - axios配置
   */
  async function handleDelete<T> (url: string, config: AxiosRequestConfig): Promise<RequestResultHook<T>> {
    return useRequest<T>({ url, method: 'delete', axiosConfig: config })
  }

  return {
    get,
    post,
    put,
    delete: handleDelete,
  }
}

async function getRequestResponse (
  instance: AxiosInstance,
  method: RequestMethod,
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<unknown> {
  let res: unknown
  if (method === 'get' || method === 'delete') {
    res = await instance[method](url, config)
  } else {
    res = await instance[method](url, data, config)
  }
  return res
}
