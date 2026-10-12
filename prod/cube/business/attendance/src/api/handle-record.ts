import { type BaseAPIResult, Get, service } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './common-type'

const baseURL = '/attendance'

// 日志记录列表
export const getHandleLogPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseURL + '/attendanceLog/page', { params })
}
// 导出操作日志记录
export const exportHandleLog = async (params: unknown): Promise<BaseAPIResult> => {
  return service.get(baseURL + '/attendanceLog/export', { params })
}
