import request from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/request';
let baseURL = '/api/file'

//文件
export const uploadFile = (data) =>
  request({
    url: baseURL + `/file`,
    method: "post",
    data,
  });

//删除文件
export const deleteFileRemove = (id) =>
  request({
    url: baseURL + `/file/${id}`,
    method: "delete",
  });