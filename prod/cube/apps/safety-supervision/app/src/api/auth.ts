import { Get, type BaseAPIResult, Post, Delete, Put } from '@ghcloud/ghcloud-business-request'
export interface PageResult {
  total: number;
  page: number;
  records: unknown[];
}

const baseUrl = '/dataintegrate'
export const getmarketlist = async (params: {
  pageNumber: number;
  pageSize: number;
  keyword?: string;

}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/market-config/page', { params })
}
export const addmarket = async (data: {
  marketName: string;
  marketCode: string;
  marketTenant: string;
  url: string;
  account: string;
  password: string;
  coordinate: string;
  address: string;
  foundTime: string;

}): Promise<BaseAPIResult> => {
  return Post(baseUrl + '/market-config', data)
}
export const deletemarket = async (id: string): Promise<BaseAPIResult> => {
  return Delete(baseUrl + `/market-config/${id}`)
}
export const putmarket = async (data: {
  id: string;marketName: string;
  marketCode: string;
  marketTenant: string;
  url: string;
  account: string;
  password: string;
  coordinate: string; }): Promise<BaseAPIResult> => {
  return Put(baseUrl + `/market-config/${data.id}`, data)
}
