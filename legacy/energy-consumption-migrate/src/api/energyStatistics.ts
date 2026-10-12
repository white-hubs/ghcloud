import { request } from '@/service/index'
const baseURL = "/energymanagement";
enum URL {
  CarboEmissionStatistics = '/carbon-emission-statistics',
  CarboEmissionTrends = '/energy-daily-summary/trend',
  ProportionOfCarbonEmissions = '/proportion-of-carbon-emissions-items/',
  AreaProjectTree = '/area-project/tree',
  EnergyArea = '/energy-area',

}
/**
 *
 * 碳排统计
 */

export const CarboEmissionStatistics = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL+URL.CarboEmissionStatistics)
}
/**
 *
 * 碳排趋势
 */

export const CarboEmissionTrends = async (params?: any): Promise<Service.RequestResult> => {
  return request.get(baseURL+URL.CarboEmissionTrends, { params: { ...params } })
}
/**
 *
 * 碳排分项占比
 */
export const ProportionOfCarbonEmissions = async (params: {
  timeFlag: string;
  period: string; }): Promise<Service.RequestResult> => {
  return request.get(baseURL+URL.ProportionOfCarbonEmissions, { params: { ...params } })
}
/**
 *
 * 区域
 */
export const AreaProjectTree = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL+URL.AreaProjectTree)
}
interface AreaData {treeIds: any[], timeFlag: string, instrumentType?: string, period: string }

/**
 * @returns
 */
export const EnergyArea = async (data: AreaData): Promise<Service.RequestResult> => {
  return request.post(baseURL+URL.EnergyArea, data)
}
