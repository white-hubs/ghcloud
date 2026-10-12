import { Post, Get, type BaseAPIResult, Delete } from '@ghcloud/ghcloud-business-request'
const baseUrl = '/ouaa'

// oss上传
export const generate = async (): Promise<BaseAPIResult> => {
  return Post(baseUrl + '/tenant-client/generate', {})
}
export const getClient = async (): Promise<BaseAPIResult> => {
  return Get(baseUrl + '/tenant-client', {})
}
export const setClient = async (clientCode: string, scopeCode: string): Promise<BaseAPIResult> => {
  return Post(baseUrl + `/tenant-client/${clientCode}/${scopeCode}`, {})
}
export const uploadFile = async (data: FormData): Promise<BaseAPIResult> => {
  return Post('file/file', {
    data
  })
}
export const deleteClient = async (clientCode: string, scopeCode: string): Promise<BaseAPIResult> => {
  return Delete(baseUrl + `/tenant-client/${clientCode}/${scopeCode}`, {})
}

// 通过id查文件
