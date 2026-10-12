import { Get, Post, Put, Delete, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './common-type'
import type { QuestionRow } from '@/types/question'
const baseUrl = '/safety-education'

/** 考题库分页列表 */
export const getQuestionPage = async (params: {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/exam-question-bank/page', { params })
}

/** 新增考题 */
export const questionInsert = async (params: QuestionRow): Promise<BaseAPIResult<PageResult>> => {
  return Post(baseUrl + '/exam-question-bank', params)
}

/** 考题详情 */
export const questionDetail = async (params: { id: string; }): Promise<BaseAPIResult<QuestionRow>> => {
  return Get(baseUrl + '/exam-question-bank/' + params.id)
}
/** 修改考题 */
export const questionUpdate = async (params: QuestionRow): Promise<BaseAPIResult<PageResult>> => {
  return Put(baseUrl + `/exam-question-bank/${params.id}`, params)
}

/** 考题删除 */
export const questionDel = async (params: { id: string; }): Promise<BaseAPIResult<unknown>> => {
  return Delete(baseUrl + `/exam-question-bank/${params.id}`)
}
