import { request, type RequestReturnType } from '@ghcloud/cube-app-js-sdk'
import type { BasicState, ActivityState, CoolWaterUsedState, ElectricityRateState } from './index.i'
const baseUrl = '/api/securitymanagement'
/**
 * 基础数据统计
 * @param params
 * @returns
 */
export const getDeviceBasicStatistic = async (params?: Record<string, string | number>): Promise<RequestReturnType<BasicState>> => {
  return request<BasicState>({
    url: baseUrl + '/basic-data-report-analysis',
    method: 'GET',
    params,
  })
}
/**
 * 获取活跃商户数据
 * @param params
 * @returns
 */
export const getActivityMerchant = async (params?: Record<string, string | number>): Promise<RequestReturnType<ActivityState>> => {
  return request<ActivityState>({
    url: baseUrl + '/merchant-activity-data',
    method: 'GET',
    params,
  })
}
/**
 * 冷冻水使用数据、冷冻水使用趋势图、费用趋势
 * @param params
 * @returns
 */
export const getCoolWaterUsedStatistics = async (params: Record<string, string | number>): Promise<RequestReturnType<CoolWaterUsedState>> => {
  return request<CoolWaterUsedState>({
    url: baseUrl + '/chilled-water-data',
    method: 'GET',
    params,
  })
}
/**
 * 耗电统计
 * @param params
 * @returns
 */
export const getElectricityRate = async (params: Record<string, string | number>): Promise<RequestReturnType<ElectricityRateState>> => {
  return request<ElectricityRateState>({
    url: baseUrl + '/cold-water-electricity',
    method: 'GET',
    params,
  })
}
