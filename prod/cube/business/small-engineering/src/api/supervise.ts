import { Get, type BaseAPIResult, Post } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './manage'
import type { LocationQueryValue } from 'vue-router'
import type { SuperviseDetailVo, SuperviseProgressVo } from './type'
const baseUrl = '/loose-works'
export const getschedule = async (params: {
  pageNumber: number;
  pageSize: number;
  period?: string;
  keyword: string;
  status?: string | undefined;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/project/schedule/list', { params })
}
export const getdept = async (): Promise<BaseAPIResult<any>> => {
  return Get('/ouaa/authenticated/organizations/list?enabled=true', { })
}
export interface ScheduleType {
  scheduleId: string;
  schedule: number;
  description: string;
  fileIds: string[];
  hasProblem: boolean;
  problemDes: string;
  problemFileIds: string[];
}
export interface AcceptType {
  scheduleId: string;
  acceptanceResult: string;
  description: string;
  fileIds: string[];

}
export const schedulefeedback = async (data: ScheduleType): Promise<BaseAPIResult<{
  scheduleId: string;
  schedule: string;
  description: string;
  fileIds: string [

  ];
  hasProblem: boolean;
  problemDes: string;
  problemFileIds: string[

  ];

}>> => {
  return Post(baseUrl + '/project/schedule/feedback', data, {

  })
}
export const Accept = async (data: AcceptType): Promise<BaseAPIResult<{
  scheduleId: string;

  description: string;
  fileIds: string [
  ];
  acceptanceResult: string;

}>> => {
  return Post(baseUrl + '/project/schedule/checkAccept', data, {

  })
}
export const scheduledetail = async (id: LocationQueryValue | LocationQueryValue[]): Promise<BaseAPIResult<SuperviseDetailVo>> => {
  return Get(baseUrl + `/project/schedule/detail/${id}`, {})
}
export const trackDownList = async (id: LocationQueryValue | LocationQueryValue[]): Promise<BaseAPIResult<SuperviseProgressVo[]>> => {
  return Get(baseUrl + `/project/schedule/${id}/trackDownList`, {})
}
export const trackDownDetail = async (id: LocationQueryValue | LocationQueryValue[]): Promise<BaseAPIResult> => {
  return Get(baseUrl + `/project/schedule/trackDownDetail/${id}`, {})
}
// 获取工程类型列表
export const getProjectTypeList = async (): Promise<unknown> => {
  return Get(baseUrl + '/project-type/list', {})
}
