import { Get, Post, Put, Delete, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './common-type'
import type { InsertTrainingTask, TrainingTaskStatus } from '@/types/training-task'
const baseUrl = '/safety-education'

/** 培训任务分页列表 */
export const getTrainingTaskPage = async (params: {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
  period?: string;
  cultivateTaskStatus?: string | undefined;
  themeId?: string | undefined;
  cultivateMode?: string | undefined;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/cultivate-task/page', { params })
}

/** 新增培训任务 */
export const trainingTaskInsert = async (params: InsertTrainingTask): Promise<BaseAPIResult<PageResult>> => {
  return Post(baseUrl + '/cultivate-task', params)
}

/** 培训任务 详情 */
export const trainingTaskDetail = async (params: { id: string; }): Promise<BaseAPIResult<InsertTrainingTask & { id: string; }>> => {
  return Get(baseUrl + '/cultivate-task/' + params.id)
}

/** 修改培训任务 */
export const trainingTaskUpdate = async (params: InsertTrainingTask & { id: string; }): Promise<BaseAPIResult> => {
  return Put(baseUrl + `/cultivate-task/${params.id}`, params)
}

/** 删除培训任务 */
export const trainingTaskDel = async (params: {
  id: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Delete(baseUrl + `/cultivate-task/${params.id}`)
}

/** 培训任务发布 */
export const TrainingTaskStatusUpdate = async (params: { id: string; status: TrainingTaskStatus; }): Promise<BaseAPIResult> => {
  return Put(baseUrl + `/cultivate-task/${params.id}/update/${params.status}`, params)
}
