import request from "@/utils/request";
let baseURL = "/api/message2";
//  || process.env.NODE_ENV === "loc"
// if (process.env.NODE_ENV === "lzy" || process.env.NODE_ENV === "loc") {
//   baseURL = "http://192.168.2.89:3100/message";
// }

/* 平台消息配置 */

// 平台消息配置新增
export const satMsgConfig = (method, data) =>
  request({
    url: baseURL + "/sat-msg-config",
    method: method,
    data,
  });

// 平台消息配置列表
export const satMsgConfigList = (method, params) =>
  request({
    url:
      baseURL +
      "/sat-msg-configs/" +
      (params.satMsgDefineCode ? params.satMsgDefineCode : params),
    method: method,
    params,
  });

// 批量查询平台消息配置列表
export const batchSatMsgConfigList = (method, params) =>
  request({
    url:
      baseURL +
      "/sat-msg-configs?satMsgDefineCodes=" +
      (params.codes ? params.codes : params),
    method: method,
  });

