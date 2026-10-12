import request from "@/utils/request";

let baseURL = "/api/file";
if (process.env.NODE_ENV === "lzy") {
  // baseURL = 'http://192.168.2.89:3100/ouaa'
  // baseURL = 'http://192.168.2.184:3100/ouaa'
}

//文件
export const uploadFile = (type, params, pathParams) =>
  request({
    url: baseURL + `/file`,
    method: "post",
    params,
  });

//删除文件
export const deleteFileRemove = (params) =>
  request({
    url: baseURL + `/file/${params.id ? params.id : params}`,
    method: "delete",
  });
