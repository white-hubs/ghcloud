import { type BaseAPIResult, Get } from '@ghcloud/ghcloud-business-request'
export interface PageResult {
  total: number;
  page: number;
  records: unknown[];
}
const baseUrl = '/dispatch'
/** 获取文件列表 */
export const getFileForPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get(`${baseUrl}/dispatch-platform/file/page`, { params })
}
