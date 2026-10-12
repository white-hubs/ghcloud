import { Get, Post, Put, Delete, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './common-type'
import type { CoursewareRow } from '@/types/question'
const baseUrl = '/safety-education'

/** 课件库分页列表 */
export const getCoursewarePage = async (params: {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/courseware-library/page', { params })
}

/** 新增课件 */
export const coursewareInsert = async (params: CoursewareRow): Promise<BaseAPIResult<PageResult>> => {
  return Post(baseUrl + '/courseware-library', params)
}

/** 课件详情 */
export const coursewareDetail = async (params: { id: string; }): Promise<BaseAPIResult<CoursewareRow & { file: unknown; }>> => {
  return Get(baseUrl + '/courseware-library/' + params.id)
}
/** 修改主题 */
export const coursewareUpdate = async (params: CoursewareRow & { id: string; }): Promise<BaseAPIResult<PageResult>> => {
  return Put(baseUrl + `/courseware-library/${params.id}`, params)
}

/** 课件删除 */
export const coursewareDel = async (params: { id: string; }): Promise<BaseAPIResult<unknown>> => {
  return Delete(baseUrl + `/courseware-library/${params.id}`)
}
