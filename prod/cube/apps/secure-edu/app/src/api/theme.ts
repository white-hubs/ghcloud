import { Get, Post, Put, Delete, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './common-type'
const baseUrl = '/safety-education'

/** 主题分页列表 */
export const getThemePage = async (params: {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/theme/page', { params })
}

/** 新增主题 */
export const themeInsert = async (params: {
  name: string;
  remark: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Post(baseUrl + '/theme', params)
}

/** 修改主题 */
export const themeUpdate = async (params: {
  id: string;
  name: string;
  remark: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Put(baseUrl + `/theme/${params.id}`, params)
}

/** 删除主题 */
export const themeDel = async (params: {
  id: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Delete(baseUrl + `/theme/${params.id}`)
}
