import request from '@/service/request'
import type { RecordType } from './models/record'
const baseUrl = '/api/smartcard/'
/**
 * 智能卡分页查询
 */
export async function getCardPage<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: baseUrl + 'smartcard/card',
    method: 'GET',
    params
  })
}
/**
 * 访客记录分页查询
 */
export async function getVisitingPage<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: baseUrl + 'smartcard/visiting',
    method: 'GET',
    params
  })
}
/**
 * 门禁记录分页查询
 */
export async function getAccessPage<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: baseUrl + 'smartcard/event',
    method: 'GET',
    params
  })
}
/**
 * 梯控记录分页查询
 */
export async function getLadderControlPage<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: baseUrl + 'smartcard/access',
    method: 'GET',
    params
  })
}
