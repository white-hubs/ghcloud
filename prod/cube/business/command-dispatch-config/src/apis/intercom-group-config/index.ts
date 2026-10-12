import { type BaseAPIResult, Get, Post, Delete, Put } from '@ghcloud/ghcloud-business-request'
export interface PageResult {
  total: number;
  page: number;
  records: unknown[];
}
const baseUrl = '/dispatch'
const baseUrl2 = '/fusion-communicate'
/** 获取分组列表 */
export const getInterComGroup = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get(`${baseUrl}/dispatch-device-group/page`, { params })
}
/**
 * 新增对讲分组
 * @param params
 * @returns
 */
export const addInterComGroup = async (data: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Post(`${baseUrl}/dispatch-device-group`, data)
}
/**
 * 获取设备分页
 */
export const getDevicePage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get(`${baseUrl}/dispatch-device/page`, { params })
}
/**
 * 修改设备
 */
export const updateDevice = async (data: Record<string, unknown>): Promise<BaseAPIResult<PageResult>> => {
  return Put(`${baseUrl}/dispatch-device/${data.id}`, data)
}
/**
 * 新增关联人员
 *
 */
export const addRelationMember = async (data: { code: string; deviceCodes: string; }): Promise<BaseAPIResult<PageResult>> => {
  return Post(`${baseUrl}/dispatch-device-group/${data.code}/add-and-delete/member?deviceCodes=${data.deviceCodes}`, data)
}
/**
 * 删除调度分组
 */
export const deleteInterComGroup = async (data: { code: string; }): Promise<BaseAPIResult<PageResult>> => {
  return Delete(`${baseUrl}/dispatch-device-group/code/${data.code}`)
}
/**
 * 更新调度分组
 */
export const updateInterComGroup = async (data: Record<string, unknown>): Promise<BaseAPIResult<PageResult>> => {
  return Put(`${baseUrl}/dispatch-device-group/${data.id}`, data)
}
/**
 * 通讯账号分页列表
 */
export const getFusionCommunicateAccount = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get(`${baseUrl2}/fusion-communicate-account/page`, { params })
}
