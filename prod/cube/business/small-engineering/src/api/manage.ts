import { Get, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'
import type { LocationQueryValue } from 'vue-router'
const baseUrl = '/loose-works'
export interface PageResult {
  total: number;
  pages: number;
  records: {
    nodes: string[];
    processInsId: string;
    projectName: string;
    projectNum: string;
    completionTime: number;
    status: string;
  }[];
}

/** 工程分页列表 */
export const getnodeList = async (params: {
  pageNumber: number;
  pageSize: number;
  submitTime: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/project/apply/nodeList', { params })
}
export const getApplyList = async (params: {
  pageNumber: number;
  pageSize: number;

  submitTime?: string;
  type?: string;
  businessType: string;
  status?: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/project/apply/list', { params })
}
/**
 *
 * 统计数据
 * @returns
 */
export const getApplystatistics = async (params: {
  period: string;

}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/project/statistics', { params })
}

/**
 *
 * 详情
 * @returns
 */
export const getApplydetail = async (processInsId: LocationQueryValue | LocationQueryValue[]): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + `/project/detail/${processInsId}`)
}
