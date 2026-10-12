import request from '@/service/request'
import type { RecordType } from './models/record'
const baseUrl = '/api/securitymanagement/'
/**
 * 车流查询
 */
export async function getVehicleFlowPage<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: baseUrl + 'vehicle-flow-monitoring-page',
    method: 'GET',
    params
  })
}
