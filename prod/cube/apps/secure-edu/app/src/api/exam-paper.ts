import { Get, Post, Put, Delete, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './common-type'
import type { InsertExamPapaer } from '@/types/exam-paper'
const baseUrl = '/safety-education'

/** 试卷分页列表 */
export const getExamPaperPage = async (params: {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/exam-paper/page', { params })
}

/** 新增试卷 */
export const examPaperInsert = async (params: InsertExamPapaer): Promise<BaseAPIResult<PageResult>> => {
  return Post(baseUrl + '/exam-paper', params)
}

/** 试卷详情 */
export const examPaperDetail = async (params: { id: string; }): Promise<BaseAPIResult<InsertExamPapaer>> => {
  return Get(baseUrl + '/exam-paper/' + params.id)
}
/** 修改试卷 */
export const examPaperUpdate = async (params: InsertExamPapaer & { id: string; }): Promise<BaseAPIResult> => {
  return Put(baseUrl + `/exam-paper/${params.id}`, params)
}

/** 试卷删除 */
export const examPaperDel = async (params: { id: string; }): Promise<BaseAPIResult> => {
  return Delete(baseUrl + `/exam-paper/${params.id}`)
}
