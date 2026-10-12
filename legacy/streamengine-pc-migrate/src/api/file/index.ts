import { request } from "@/service";
let baseURL = '/file'

//oss上传
export const uploadFile = (params: FormData) => {
  return request.post(baseURL + `/file`, params, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

//通过id查文件
export const getFileByID = (params: { id: string | number }) => {
  return request.get(baseURL + `/file/${params.id}`);
}