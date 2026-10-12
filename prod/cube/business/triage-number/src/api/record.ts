import request from '@/service/request'
import type { RecordType } from './models/record'
const baseUrl = '/api/securitymanagement/'
/**
 * 记录查询
 */
export async function getRecordPage<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: baseUrl + 'visit-record-page',
    method: 'GET',
    params
  })
}
