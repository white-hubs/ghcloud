import request from "@/service/request"
import { inspectVehicleTotal, propertyVehicleBar } from './alarm'
import moment from 'moment'
const baseURL = '/api/safety-management'

// 各市场小散工程数
export function safetyMarketLooseWorks<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/looseWorks/projectRecord`,
      method: "GET",
      params
  });
}

// 各市场小散工程巡检任务数排名
export function safetyMarketInspection<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/safety/marketInspection`,
        method: "GET",
        params
    });
}

// 工程巡检统计
export function safetyMarketInspectionStatistics<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/safety/inspection`,
      method: "GET",
      params
  });
}

// 小散工程-工程整改数排名
export function safetyMarketLooseWorkStatisticsReform<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/loose/works/statistics/reform`,
      method: "GET",
      params
  });
}

// 小散工程-工程整记录
export function safetyMarketLooseWorkStatisticsReformPage<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/loose/works/statistics/reform/page`,
      method: "GET",
      params
  });
}

// 小散工程-工程巡查记录
export function safetyMarketInspectRecord<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/safety/statistics/inspect/record/page`,
      method: "GET",
      params
  });
}




