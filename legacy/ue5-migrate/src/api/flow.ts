import request from "../service/request";
import { FlowNumberStatistic } from "./models/flow";
const baseURL = '/api/flow'
/**
 * 统计流程实例数量
 */
export function getFlowNumberStatistic<T extends Record<string, any>>(params?: T):Promise<FlowNumberStatistic[]> {
    return request<FlowNumberStatistic[]>({
        url: `${baseURL}/statistics/application/number`,
        method: "GET",
        params
    })
}

/** 工单完成统计 */
export function workOrderCompletionStatistics<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: `${baseURL}/statistics/number`,
      method: "get",
      params
  });
}

/** 工单完成统计 */
export function getFlowOrderPage<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: `${baseURL}/process/instance/flowOrder/all`,
      method: "get",
      params
  });
}