import { request, service } from '@/service/index'
import type { SelectValue } from 'ant-design-vue/lib/select'
const baseURL = "/energymanagement";
enum URL {
  DosageAnalysis = '/dosage-analysis/',
  MeterArea = '/enumType/getInstumenttype/',
  RouteTree = '/route-project/tree',
  AreaTree = '/area-project/tree',
  EnergyAnalysisg = '/energy-analysis-distribution',
  EnergyAnalysis = '/energy-analysis',
  EnergyRanking = '/energy-consumption-ranking',
  EetailsExcel = '/api/energymanagement/energy-consumption-details/excel',
  GetDetails = '/energy-consumption-details',
  Distribution = '/distribution-statistics',
  iotDistribution = '/iot-distributions',
}
/**
 * 获取用能明细
 */
export const GetDetails = async (data: {
  filterFlag: string
  timeFlag: string
  ids: string[]
  treeIds: any[]
  instrumentType: string
}): Promise<Service.RequestResult> => {
  return request.post(baseURL+URL.GetDetails, data)
}
export const EetailsExcel = async (data: {
  filterFlag: string
  timeFlag: string
  ids: string[]
  instrumentType: string
}): Promise<Service.RequestResult> => {
  return service.post(URL.EetailsExcel, data)
}
/**
 *
 * 用能分析及能耗分布
#74285948

 */

export const EnergyAnalysis = async (data: {
  filterFlag: string
  timeFlag: string
  ids: string[]
  instrumentType: string
}): Promise<Service.RequestResult> => {
  return request.post(baseURL+URL.EnergyAnalysis, data)
}
export const EnergyAnalysisg = async (data: {
  filterFlag: string
  timeFlag: string
  ids: string[]
  instrumentType: string
}): Promise<Service.RequestResult> => {
  return request.post(baseURL+URL.EnergyAnalysisg, data)
}
export const EnergyRanking = async (data: {
  filterFlag: string
  timeFlag: string
  ids: string[]
  instrumentType: string
}): Promise<Service.RequestResult> => {
  return request.post(baseURL+URL.EnergyRanking, data)
}
/**
 *
 * 碳排统计
 */
interface AreaData {treeIds: any[], timeFlag: string, instrumentType?: string, period: string }
export const DosageAnalysis = async (data: AreaData): Promise<Service.RequestResult> => {
  return request.post(baseURL+URL.DosageAnalysis, data)
}
/**
 * 仪表区域列表
 *
 */
export const MeterArea = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL+URL.MeterArea)
}
/**
 * 获取支路
 */
export const RouteTree = async (routeName: string, instrumentType: string): Promise<Service.RequestResult> => {
  return request.get(baseURL+URL.RouteTree, {
    params: {
      routeName, instrumentType
    }
  })
}
/**
 *
 * 获取区域
 * @returns
 */
export const AreaTree = async (areaName: string, instrumentType: string): Promise<Service.RequestResult> => {
  return request.get(baseURL+URL.AreaTree, {
    params: {
      areaName,
      instrumentType
    }
  })
}
export const Distribution = async (deviceid: SelectValue): Promise<Service.RequestResult> => {
  return request.get(baseURL+URL.Distribution + `/${deviceid}`)
}
export const iotDistribution = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL+URL.iotDistribution)
}
