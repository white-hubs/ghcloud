import request from "../service/request";
const baseURL = '/api/securitymanagement/'
/**
 * 客流统计
 */
export function passengerFlowStatistics<T extends Record<string, any>>(params?: T):Promise<any> {
    return request<{inCount:number,inMuseum:number, outCount:number,rateIn:number,rateOut:number}>({
        url: `${baseURL}passenger-flow-statistics`,
        method: "GET",
        params
    })
}
/**
 * 各区域客流量排名
 */
export function passengerFlowRegions<T extends Record<string, any>>(params?: T):Promise<any[]> {
  return request<{areaName:string,num:number}[]>({
      url: `${baseURL}ranking-passenger-flow-regions`,
      method: "GET",
      params
  })
}
/**
 * 在馆客流分析图
 */
export function passengerFlowMuseum<T extends Record<string, any>>(params?: T):Promise<any> {
  return request<{analysis:[],xtitle:[]  }>({
      url: `${baseURL}analysis-chart-passenger-flow-museum`,
      method: "GET",
      params
  })
}