import request from "@/utils/request";
let baseURL = `/api/identity`;

//获取收费项目列表
export const generateBatch = (params, type) =>
  request({
    url: baseURL + "/qrcode/generate/batch/download",
    method: "post",
    params,
    responseType: "blob",
  });
