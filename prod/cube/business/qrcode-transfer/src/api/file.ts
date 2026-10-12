import request from '@/utils/request'
const baseUrl = '/api/file/'

interface ReturnFileType {
  id: string;
  name: string;
  path: string;
  type?: string;
  size?: number;
  accessPrefix?: string;
  businessKey?: string | null;
}

export const uploadFile = async (params: FormData): Promise<ReturnFileType> => {
  return request.post(baseUrl + '/file', params, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
