import { request, service } from '@/service/index'
const baseURL = "/energymanagement";
enum URL {
  LoadforecastionTrand = '/load-forecasting/trend',
  LoadforecastionExport = '/api-energy/load-forecasting/export',
  EnergyGateList = '/energy-gate/list',
  EnergyGate = '/energy-gate/',
  occupancy = '/occupancy-rate',
}
/**
 *
 *综合能耗 碳排统计
 */

export const getOccupancy = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL+URL.occupancy)
}
export const EnergyGateList = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL+URL.EnergyGateList)
}
export const EnergyGate = async <T> (id: string, data: {
  id?: string; energyType?: string; open: T
}): Promise<Service.RequestResult> => {
  return request.put(baseURL+URL.EnergyGate + id, data)
}
export const LoadforecastionTrand = async (data: {
  filterFlag: string
  timeFlag: string
  ids: string[]
  instrumentType: string
}): Promise<Service.RequestResult> => {
  return request.post(baseURL+URL.LoadforecastionTrand, data)
}

export const LoadforecastionExport = async (data: {
  filterFlag: string
  timeFlag: string
  ids: string[]
  instrumentType: string
}): Promise<Service.RequestResult> => {
  return service.post(baseURL+URL.LoadforecastionExport, data)
}
