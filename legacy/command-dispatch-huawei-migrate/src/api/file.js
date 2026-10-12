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
export const uploadFile = (params, type) =>
  request({
    url: !window?.config?.feature?.useUploadTemporary ? baseURL + `/file` : `${baseURL}/upload/temporary`,
    method: "post",
    params,
  });

//文件
export const uploadFile1 = (params, type) =>
  request({
    url: baseURL + `/file/upload`,
    method: "post",
    params,
  });
