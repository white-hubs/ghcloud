
import { Get, service, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'
import type { LocationQueryValue } from 'vue-router'
import type { PageResult } from '../common-type'

const baseUrl = '/safety-education'

export const extendStatPage = async (params: {
  period: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/cultivate-task/page/extendStat', {
    params
  })
}
export const userPage = async (params: {
  cultivateTaskId: LocationQueryValue | LocationQueryValue[];

}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/cultivate-task-user/page', {
    params
  })
}
export const examStatPage = async (params: { period: string | undefined; }): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/exam-task-statistics/page', {
    params
  })
}
export const themesList = async (): Promise<BaseAPIResult<{
  name: string;
  id: string;
}[]>> => {
  return Get(baseUrl + '/themes', {

  })
}
export const examuserpage = async (
  params: {
    examTaskId: LocationQueryValue | LocationQueryValue[];

  }
): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/exam-task-statistics/user-page', {
    params

  })
}
export const examexport = async (
  data: {
    period: string;
  }
): Promise<BaseAPIResult> => {
  return service.post(baseUrl + '/exam-task-statistics/page/export', data)
}
export const trainExportAxios = async (
  data: {
    period: string;
  }
): Promise<BaseAPIResult> => {
  return service.post(baseUrl + '/cultivate-task/extendStat/export', data)
}
export const examuserexport = async (data: { examTaskId: LocationQueryValue | LocationQueryValue[]; }): Promise<BaseAPIResult> => {
  return service.post(baseUrl + '/exam-task-statistics/user-page/export', data)
}
export const trainuserexport = async (data: { cultivateTaskId: LocationQueryValue | LocationQueryValue[]; }): Promise<BaseAPIResult> => {
  return service.post(baseUrl + '/cultivate-task-user/export', data)
}
