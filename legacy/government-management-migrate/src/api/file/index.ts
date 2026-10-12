import { request } from '@/service/index'
const baseUrl = '/file'

// oss上传
export const uploadFile = async (params: FormData): Promise<Service.RequestResult<UploadRes>> => {
  return request.post(baseUrl + '/file', params, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 通过id查文件
export const getFileById = async (params: { id: string | number; }): Promise<Service.RequestResult<unknown>> => {
  return request.get(baseUrl + `/file/${params.id}`)
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
export interface OSSFile {
  businessKey: number;
  id: number;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  type: string;
}
