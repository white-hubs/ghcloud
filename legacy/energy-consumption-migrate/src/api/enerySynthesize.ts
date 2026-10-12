import { request } from '@/service/index'
const baseURL = "/energymanagement";
enum URL {
  ComprehensiveEnergyConsumption = '/comprehensive-energy-consumption',
  ComprehensiveEnergyConsumptionTrend = '/comprehensive-energy-consumption-trend',
  EnergyProject = '/project',

}
/**
 *
 *综合能耗 碳排统计
 */

export const ComprehensiveEnergyConsumption = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL+URL.ComprehensiveEnergyConsumption)
}
/**
 *
 * 碳排趋势
 * @returns
 */
export const ComprehensiveEnergyConsumptionTrend = async (params: {
  timeFlag: 'TODAY' | 'THIS_MONTH' | 'THIS_YEAR';
  period: string; }): Promise<Service.RequestResult> => {
  return request.get(baseURL+URL.ComprehensiveEnergyConsumptionTrend, { params: { ...params } })
}
/**
 *
 * 电力分项统计
 * @returns
 */
export const EnergyProject = async (params: {
  timeFlag: string;
  instrumentType: string;
  period: string;
}): Promise<Service.RequestResult> => {
  return request.get(baseURL+URL.EnergyProject, {
    params
  })
}
