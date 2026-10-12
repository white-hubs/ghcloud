import { Get, Post, Put, Delete, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './common-type'
import type { ExamTaskPaperDetail, InsertExamTask } from '@/types/exam-task'
const baseUrl = '/safety-education'

/** 考试任务分页列表 */
export const getExamTaskPage = async (params: {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/exam-task/page', { params })
}

/** 新增考试任务 */
export const examTaskInsert = async (params: InsertExamTask): Promise<BaseAPIResult<PageResult>> => {
  return Post(baseUrl + '/exam-task', params)
}

/** 考试任务详情 */
export const examTaskDetail = async (params: { id: string; }): Promise<BaseAPIResult<InsertExamTask & { id: string;examPapers: { id: string;name: string; }[];chargeUserName: string; }>> => {
  return Get(baseUrl + '/exam-task/' + params.id)
}
/** 修改考试任务 */
export const examTaskUpdate = async (params: InsertExamTask & { id: string; }): Promise<BaseAPIResult> => {
  return Put(baseUrl + `/exam-task/${params.id}`, params)
}

/** 考试任务删除 */
export const examTaskDel = async (params: { id: string; }): Promise<BaseAPIResult<unknown>> => {
  return Delete(baseUrl + `/exam-task/${params.id}`)
}

/** 考试任务发布 */
export const examTaskPublish = async (params: { id: string; }): Promise<BaseAPIResult> => {
  return Put(baseUrl + `/exam-task/published/${params.id}`, params)
}

/** 考试任务撤回 */
export const examTaskWithdraw = async (params: { id: string; }): Promise<BaseAPIResult> => {
  return Put(baseUrl + `/exam-task/withdraw/${params.id}`, params)
}

/** 获取考试试卷详情 */
export const examTaskPaperDetail = async (params: { id: string;examPaperId: string; }): Promise<BaseAPIResult<ExamTaskPaperDetail>> => {
  return Get(baseUrl + `/exam-task/${params.id}/paper/${params.examPaperId}`)
}
