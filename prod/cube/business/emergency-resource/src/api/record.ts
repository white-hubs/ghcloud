import request from '@/service/request'
import type { FundTableData, Organizationtype, RecordType } from './models/record'
const baseUrl = '/api/emergency/'
/**
 * 应急物资分页
 */
export async function getMaterialListPage<T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: baseUrl + 'emergency-supplies/page',
    method: 'GET',
    params
  })
}
/**
 * 出入库分页
 */
export async function getInoutList <T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: baseUrl + 'emergency-supplies-inout-record/page',
    params,
    method: 'GET'
  })
}
/**
 * 应急资金分页查询
 */
export async function getFundInOutList <T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: baseUrl + 'emergency-fund-inout-record/page',
    params,
    method: 'GET'
  })
}

/**
 * 应急资金每日统计
 */
export async function getFundRecordList <T extends Record<string, unknown>> (params: T): Promise<FundTableData[]> {
  return request<FundTableData[]>({
    url: baseUrl + 'emergency-fund-inout-record/stat',
    params,
    method: 'GET'
  })
}
/**
 * 应急组织树
 */
export async function getEmergencyOrganizationList (): Promise<ReturnPageType<Organizationtype[]>> {
  return request<ReturnPageType<Organizationtype[]>>({
    url: baseUrl + 'emergency-organization/tree',
    method: 'GET'
  })
}
/**
 * 应急人员分页查询
 */
export async function getEmergencyUserList <T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: baseUrl + 'emergency-user/page',
    params,
    method: 'GET'
  })
}
/**
 * 应急人员分类树
 */
export async function getUserCategoryTree (): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: baseUrl + 'emergency-user-category/tree',
    method: 'GET'
  })
}
/**
 * 应急设备分页查询
 */
export async function getEmergencyDevice <T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: baseUrl + 'emergency-device/page',
    params,
    method: 'GET'
  })
}
/**
 * 应急设施分页
 */
export async function getEmergencyFacility <T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: baseUrl + 'emergency-facility/page',
    params,
    method: 'GET'
  })
}
/**
 * 设备使用记录分页
 */
export async function getEmergencyUsedRecord <T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: baseUrl + 'emergency-device-used-record/page',
    params,
    method: 'GET'
  })
}
/**
 * 应急技术分页查询
 */
export async function getEmergencyKnowledge <T extends Record<string, unknown>> (params: T): Promise<ReturnPageType<RecordType>> {
  return request<ReturnPageType<RecordType>>({
    url: baseUrl + '/emergency-knowledge/page',
    params,
    method: 'GET'
  })
}
