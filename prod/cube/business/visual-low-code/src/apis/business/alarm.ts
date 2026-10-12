import { request } from '@/service/index'
const baseURL = '/alarm/'
/**
 * @说明 报警记录列表
 * @returns
 */
export const alarmStatisticsList = async (params: unknown): Promise<Service.RequestResult> => {
  return request.get(`${baseURL}alarm-bim-statistics/records`, { params })
}
// 获取报警统计
export const getstatus = async (params: unknown): Promise<Service.RequestResult> => {
  return request.get('/alarm/alarm-bim-statistics/status', { params })
}
/**
 * 获取当前用户未处理的报警消息列表
 */
export const getAlarmMsgUnConfirmed = async (params: unknown): Promise<Service.RequestResult> => {
  return request.get(`${baseURL}alarm-msg/un-confirmed/records`, { params })
}
/**
 * 获取当前用户未处理的报警消息数量
 */
export const getAlarmMsgUnConfirmedCount = async (): Promise<Service.RequestResult<number>> => {
  return request.get(`${baseURL}alarm-msg/un-confirmed/count`)
}
