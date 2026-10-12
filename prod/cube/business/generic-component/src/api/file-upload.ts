import { Get, Post, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'
const baseUrl = '/file'

// oss上传
export const uploadFile = async (params: FormData): Promise<BaseAPIResult<UploadRes>> => {
  return Post(baseUrl + '/file', params, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 通过id查文件
export const getFileById = async (params: { id: string | number; }): Promise<BaseAPIResult> => {
  return Get(baseUrl + `/file/${params.id}`)
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
