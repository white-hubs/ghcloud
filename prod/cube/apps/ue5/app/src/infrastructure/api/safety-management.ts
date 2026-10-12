import request from "@/infrastructure/service/request";

const baseURL = "/api/safety-management";

/**
 * 小散工程详情列表
 */
export function looseWorksList<T extends Record<string, any>>(params: T) {
  return request<any>({
    url: `${baseURL}/looseWorks/list`,
    method: "GET",
    headers: {
      "backend-ip": "192.168.2.7",
    },
    params,
  });
}

/**
 * 市场配置
 */
export function getMarketConfig<T extends Record<string, any>>(params: T) {
  return request<any>({
    url: `/api/dataintegrate/market-config/${params.id ? params.id : params}`,
    method: "GET",
    params,
  });
}
