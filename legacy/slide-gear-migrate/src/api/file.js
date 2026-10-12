import request from "@/utils/request";
let baseURL = "/api/file";

//删除文件
export const deleteFileRemove = (id, type) =>
  request({
    url: baseURL + `/file/${id}`,
    method: "delete",
  });

//查找文件
export const fileId = (id, type) =>
  request({
    url: baseURL + `/file/${id}`,
    method: "get",
  });

// 查询文件
export const FileIds = (params, type) =>
  request({
    url: baseURL + `/file/ids`,
    method: "get",
    params,
  });

//文件
export const uploadFile = (params) =>{
  const url = params.sceneCode ? `${baseURL}/upload/temporary` : `${baseURL}/file`
  const form = new FormData()
  form.append('businessKey', params.businessKey)
  if (params.sceneCode) form.append('sceneCode', params.sceneCode)
  if (params.tenant)form.append('tenant', params.tenant)
  if (params.tag)form.append('tag', params.tag)
  if (params.file)form.append('file', params.file)
  return request({
    url: url,
    method: "post",
    params:params.sceneCode?form:params,
  });
}

//文件
export const uploadFile1 = (params, type) =>
  request({
    url: baseURL + `/file/upload`,
    method: "post",
    params,
  });
