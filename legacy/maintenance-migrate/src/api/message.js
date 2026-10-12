import request from "@/utils/request.js"
let baseURL = '/api/message'

// 消息通知记录
export const getMsgRecordTargets = (params) =>
  request({
    url: baseURL + `/msg-record/targets/${params.businessKey}`,
    method: 'get',
    params
  })
// 平台消息通道配置列表
export const getMsgChannelConfigs = (params) =>
  request({
    url: baseURL + `/sat-msg-configs/channel/${params.satMsgDefineCode}`,
    method: 'get',
    params
  })

// 批量查询平台消息配置列表
export const batchSatMsgConfigList = (method, params) =>
  request({
    url:
      baseURL +
      "/sat-msg-configs?satMsgDefineCodes=" +
      (params.codes ? params.codes : params),
    method: method,
  });

// 平台消息配置新增
export const satMsgConfig = (method, data) =>
  request({
    url: baseURL + "/sat-msg-config",
    method: method,
    data,
  });