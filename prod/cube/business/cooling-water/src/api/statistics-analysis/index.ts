import { request } from '@/service/index'
const baseUrl = '/alarm'

/** 获取报警处理统计 */
export const getAlarmHandleStatistic = async (params: {
  applicationCode: string;
  departmentId?: string | null;
  keyword?: string;
  period?: string;
  pageNumber: number;
  pageSize: number;
}): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/alarm-statistics/user-status-page', { params })
}
/**
 * 导出报警处理统计
 * @param data
 * @returns
 */
export const exportAlarmHandleStatistic = async (data: {
  period: string;
  departmentId: string | null;
  keyword: string;
  applicationCode: string;
}): Promise<unknown> => {
  return request.download(baseUrl + '/alarm-statistics/user-status/list/export', data, {
    responseType: 'blob'
  })
}
/**
 * 获取报警记录数据
 * @param params
 * @returns
 */
export const getAlarmRecord = async (params: Record<string, string | boolean | number | null>): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/alarm-records', { params })
}
/**
 * 获取通用页面报警记录
 */
export const getCommonAlarmRecord = async (params: Record<string, string | boolean | number | null>): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/alarm-records/common-page', { params })
}
/**
 * 导出报警记录
 * @param data
 * @returns
 */
export const exportAlarmRecord = async (data: Record<string, string | boolean | number | null>): Promise<unknown> => {
  return request.download(baseUrl + '/alarm-records/export', data, {
    responseType: 'blob'
  })
}
/**
 * 获取报警统计
 * @param params
 * @returns
 */
export const getAlarmStatistic = async (params: Record<string, string | number>): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/alarm-statistics/event-status-page', { params })
}
/**
 * 导出报警统计
 * @param data
 * @returns
 */
export const exportAlarmStatistic = async (data: Record<string, string | boolean | number>): Promise<unknown> => {
  return request.download(baseUrl + '/alarm-statistics/event-status/list/export', data, {
    responseType: 'blob'
  })
}
/**
 * 获取报警设备统计
 * @param params
 * @returns
 */
export const getAlarmDeviceStatistic = async (params: Record<string, string | number>): Promise<Service.RequestResult> => {
  return request.get('/securitymanagement/cold-water/device-status-page', { params })
}
