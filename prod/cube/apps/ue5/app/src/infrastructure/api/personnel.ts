import request from "../service/request";
const baseURL = "/api/ouaa";
/**
 * 查询在岗、离岗人数
 */
export function getStateTotal<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: `${baseURL}/tenant/work/status/getTotal`,
    method: "GET",
  });
}
