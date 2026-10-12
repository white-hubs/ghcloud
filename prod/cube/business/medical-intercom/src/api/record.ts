import request from '@/service/request'
import type { CallBedType, RecordType } from './models/record'

/**
 * 呼叫记录查询
 */
export async function getCallRecordPage<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: '/api/securitymanagement/call-records-page',
    method: 'GET',
    params
  })
}
/**
 * 床位档案
 */
export async function bedFile<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<CallBedType>> {
  return request<ReturnPageType<CallBedType>>({
    url: '/api/securitymanagement/bed-file-page',
    method: 'GET',
    params
  })
}
/**
 * @说明 处理记录
 * @returns
 */
export async function callProcessingRecords<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<CallBedType>> {
  return request<ReturnPageType<CallBedType>>({
    url: '/api/securitymanagement/processing-records-page',
    method: 'GET',
    params
  })
}
