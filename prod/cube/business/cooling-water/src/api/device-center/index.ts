import { request } from '@/service/index'
const baseUrl = '/securitymanagement'
interface DeviceMonitorPageParams {
  keyword: string;
  pageNumber: number;
  pageSize: number;
  areaIds: string | null;
}
/**
 * 获取设备监测列表
 * @param params 分页查询参数
 * @returns 列表数据
 */
export const getDeviceMonitorList = async (params: DeviceMonitorPageParams): Promise<Service.RequestResult> => {
  return request.get(`${baseUrl}/device-monitor`, { params })
}
/**
 * 获取设备实时运行数据
 * @param id 设备id
 * @returns
 */
export const getDeviceMonitorRuningAttr = async (id: string): Promise<Service.RequestResult> => {
  return request.get(`${baseUrl}/attribute/${id}`)
}
/**
 * 获取设备详情
 * @param id 设备id /area/list
 * @returns
 */
export const getDeviceDetail = async (id: string): Promise<Service.RequestResult> => {
  return request.get(`${baseUrl}/detail/${id}`)
}
/**
 * 获取区域数据
 * @returns
 */
export const getAreaOption = async (): Promise<Service.RequestResult> => {
  return request.get('/mdata/area/list')
}
/**
 * 获取报警级别统计
 */
export const getAlarmLevelsStatistic = async (params: Record<string, string | string[]>): Promise<Service.RequestResult> => {
  return request.get('/alarm/alarm-statistics/level', { params })
}
/**
 * 获取设备事件统计
 */
export const getAlarmEventsStatistic = async (params: Record<string, string | string[]>): Promise<Service.RequestResult> => {
  return request.get('/alarm/alarm-statistics/event-group', { params })
}
// 获取设备报警趋势
export const getAlarmDeviceTrendAnalysis = async (params: Record<string, string | string[]>): Promise<Service.RequestResult> => {
  return request.get('/alarm/cold-water/alarm-statistics/trend-analysis', { params })
}
// 获取设备报警趋势
export const getAlarmEventRecords = async (params: Record<string, string | number | string[]>): Promise<Service.RequestResult> => {
  return request.get('/alarm/cold-water/alarm/event-record', { params })
}
// 获取设备属性列表
export const getDeviceAttrOptions = async (params: Record<string, string | number>): Promise<Service.RequestResult> => {
  return request.get(`${baseUrl}/cold-device-attribute-code`, { params })
}
// 获取采集明细
export const getDeviceAttrHistoryList = async (params: Record<string, string | number | null>): Promise<Service.RequestResult> => {
  return request.get(`${baseUrl}/device-attribute-data-history`, { params })
}
export const getAreaDevicePointList = async (applicationCode: string): Promise<Service.RequestResult> => {
  return request.get(`${baseUrl}/area-point/${applicationCode}`)
}
