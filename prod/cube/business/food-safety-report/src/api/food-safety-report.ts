import { Get, Post, Put, Delete, type BaseAPIResult, service } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from '@/typings/global'

const baseUrl = '/product-market'

export const getReportPage = async (params: {
  stallCode?: string;
  goodsCategoryName?: string;
  checkResult?: string | null;
  period?: string;
  status?: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/goods-safety-check/page', { params })
}
export const getReportDetail = async (params: {
  id?: string;
}): Promise<Service.RequestResult> => {
  return Get(baseUrl + `/goods-safety-check/${params.id}`, { params })
}
export const addReport = async (params: unknown): Promise<Service.RequestResult> => {
  return Post(baseUrl + '/goods-safety-check', params)
}
export const updateReport = async (params: unknown & { id: string; }): Promise<Service.RequestResult> => {
  return Put(baseUrl + `/goods-safety-check/${params.id}`, params)
}
export const deleteReport = async (params: {
  id?: string;
}): Promise<Service.RequestResult> => {
  return Delete(baseUrl + `/goods-safety-check/${params.id}`)
}
// 下载模板
export const downLoadTemplate = async (params?: {
  code?: string;
  name?: string;
}): Promise<Service.RequestResult> => {
  return service.post(baseUrl + '/goods-safety-check/template', { params })
}
// 导入
export const importExcel = async (params: FormData): Promise<BaseAPIResult<UploadRes>> => {
  return Post(baseUrl + '/goods-safety-check/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
interface UploadRes {
  accessPrefix: string;
  businessKey: null | string;
  id: string;
  name: string;
  path: string;
  refCount: 0;
  size: 687;
  suffix: string;
  tag: string;
  type: string;
}
