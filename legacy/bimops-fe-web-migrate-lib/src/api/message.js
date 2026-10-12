import request from "../utils/request";
let baseURL = "/api/message2";

/* 平台消息配置 */

// 平台消息配置新增
export const satMsgConfig = (params, method) =>
  request({
    url: baseURL + "/sat-msg-config",
    method: method,
    params,
  });

// 平台消息配置列表
export const satMsgConfigList = (params, method) =>
  request({
    url: baseURL + "/sat-msg-configs/" + (params.satMsgDefineCode ? params.satMsgDefineCode : params),
    method: method,
    params,
  });

// 批量查询平台消息配置列表
export const batchSatMsgConfigList = (params, method) =>
  request({
    url: baseURL + "/sat-msg-configs?satMsgDefineCodes=" + (params.codes ? params.codes : params),
    method: method,
  });
export const getMsgChannelConfigs = (params) =>
  request({
    url: baseURL + `/sat-msg-configs/channel/${params.satMsgDefineCode}`,
    method: "get",
    params,
  });

/* 极光消息配置 */

// 极光消息配置租户详情
export const jgMsgSet = (params, method) =>
  request({
    url: baseURL + "/msg-jg-config",
    method: method,
  });

/* 消息记录 */

// 消息记录分页
export const myMessage = (params, method) =>
  request({
    url: baseURL + "/msg-records",
    method: method,
    params,
  });

// 消息记录分页
export const unReadNum = (params, method) =>
  request({
    url: baseURL + `/msg-record/un-read/total/${params.channelType ? params.channelType : params}`,
    method: method,
    params,
  });

// 极光短配置
export const shortMsgConfigAdd = (params, method) =>
  request({
    url: baseURL + "/msg-jg-config",
    method: method,
    params,
  });

// 极光短配置
export const shortMsgConfigEdit = (params, method) =>
  request({
    url: baseURL + "/msg-jg-config/" + params.id,
    method: method,
    params,
  });

// 一键已读
export const allRead = (params, method) =>
  request({
    url: baseURL + "/msg-record/read-all/CHANNEL_SITE",
    method: "put",
    params,
  });

// 批量已读
export const checkedRead = (params, method) =>
  request({
    url: baseURL + "/msg-record/read-batch?ids=" + (params.ids ? params.ids.join(",") : params),
    method: method,
    params,
  });

// 批量删除
export const checkedDelete = (params, method) =>
  request({
    url: baseURL + "/msg-record/batch?ids=" + (params.ids ? params.ids : params),
    method: method,
    params,
  });
