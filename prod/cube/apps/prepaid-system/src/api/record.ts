import request from '@/service/request'
import type { RecordType } from './models/record'
/**
 * 电表分页列表
 */
export async function getElectricityMeter<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: '/api/prepaid/ammeter/page',
    method: 'GET',
    params
  })
}
/**
 * 电表充值记录
 */
export async function getEleRechargeRecord<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: '/api/prepaid/powerRecharge/page',
    method: 'GET',
    params
  })
}
/**
 * 电表抄表记录
 */
export async function getEleMeterReadingRecord<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: '/api/prepaid/collectRecords/page',
    method: 'GET',
    params
  })
}
/**
 * 用电查询
 */
export async function getElectricityRecord<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: '/api/prepaid/powerUserDay/page',
    method: 'GET',
    params
  })
}
/**
 * 水表分页列表
 */
export async function getWaterRecord<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: '/api/prepaid/waterMeter/page',
    method: 'GET',
    params
  })
}
/**
 * 水表充值记录
 */
export async function getRechargeRecord<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: '/api/prepaid/waterRecharge/page',
    method: 'GET',
    params
  })
}
/**
 * 水表日用水查询
 */
export async function getUseWaterRecord<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: '/api/prepaid/waterUserDay/page',
    method: 'GET',
    params
  })
}
