import { Get, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'

const baseUrl = '/safety-education'

export const cultivatestat = async (params: {
  period: string;
}): Promise<BaseAPIResult<{ cultivateNum: number;qoq: number; }>> => {
  return Get(baseUrl + '/cultivate-task/stat', {
    params
  })
}
export const examstat = async (params: {
  period: string;
}): Promise<BaseAPIResult<{ totalNum: number;chainRatio: number;noPassedUserNumber: number;missExamUserNumber: number; }>> => {
  return Get(baseUrl + '/exam-task-statistics', {
    params
  })
}
export const examtyperatio = async (params: {
  period: string;
}): Promise<BaseAPIResult<{
  totalNum: number;
  name: string;
}[]>> => {
  return Get(baseUrl + '/exam-task-statistics/type-ratio', {
    params
  })
}
export const trainUserstat = async (params: {
  period: string;
}): Promise<BaseAPIResult<{ unsignedNum: number; }>> => {
  return Get(baseUrl + '/cultivate-task/trainUser/stat', {
    params
  })
}
export const targetstat = async (params: {
  period: string;
}): Promise<BaseAPIResult<{
  name: string;
  num: number;
}[]>> => {
  return Get(baseUrl + '/cultivate-task/target/stat', {
    params
  })
}
export const taskthemestat = async (params: {
  period: string;
}): Promise<BaseAPIResult<{
  name: string;
  num: number;
}[]>> => {
  return Get(baseUrl + '/cultivate-task/theme/stat', {
    params
  })
}
export const examattendance = async (params: {
  period: string;
}): Promise<BaseAPIResult<{
  name: string;
  examUserNumber: number;
  noPassedUserNumber: number;
  missExamUserNumber: number;
}[]>> => {
  return Get(baseUrl + '/exam-task-statistics/attendance', {
    params
  })
}
export const userSignstat = async (params: {
  period: string;
}): Promise<BaseAPIResult<{ name: string;trainNum: number;unsignedNum: number;belatedNum: number; }[]>> => {
  return Get(baseUrl + '/cultivate-task/userSign/stat', {
    params
  })
}
export const examtheme = async (params: {
  period: string;
}): Promise<BaseAPIResult<{ totalNum: number; name: string; }[]>> => {
  return Get(baseUrl + '/exam-task-statistics/theme-ratio', {
    params
  })
}
export const trendstat = async (params: {
  period: string;
}): Promise<BaseAPIResult<{ name: string; num: number; }[]>> => {
  return Get(baseUrl + '/cultivate-task/trend/stat', {
    params
  })
}
export const trendexam = async (params: {
  period: string;
}): Promise<BaseAPIResult<{ name: string; num: number; }[]>> => {
  return Get(baseUrl + '/exam-task-statistics/trend', {
    params
  })
}
