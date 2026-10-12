import request from "@/utils/request";
let baseURL = "/api/file";

//删除文件
export const deleteFileRemove = (params) =>
  request({
    url: baseURL + `/file/${params.id ? params.id : params}`,
    method: "delete",
  });

//删除文件
export const deleteFile = (id) =>
  request({
    url: baseURL + `/file-ref/business-key`,
    method: "delete",
  });

//文件
export const uploadFile = (type, params, pathParams) =>
  request({
    url: baseURL + `/file`,
    method: "post",
    params,
  });

//文件-old
export const uploadFile1 = (type, params) =>
  request({
    url: baseURL + `/file/upload`,
    method: "post",
    params,
  });
