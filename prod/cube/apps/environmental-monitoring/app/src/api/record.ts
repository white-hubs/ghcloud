import request from '@/service/request'
import type { RecordType } from './models/record'
const baseUrl = '/api/securitymanagement/'
/**
 * 交通灯查询
 */
export async function getLightPage<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: baseUrl + 'environmental-monitoring-page',
    method: 'GET',
    params
  })
}
// 业务检测
export async function getBusinessDetection<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: baseUrl + 'environmental-page',
    method: 'GET',
    params
  })
}
