import request from '@/service/request'
import type { RecordType } from './models/record'
const baseUrl = '/api/securitymanagement/'
/**
 * 交通灯查询
 */
export async function getLightPage<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: baseUrl + 'traffic-light-page',
    method: 'GET',
    params
  })
}
