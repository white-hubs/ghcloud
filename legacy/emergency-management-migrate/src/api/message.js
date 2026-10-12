import request from '@/utils/request'
let baseURL = '/api/message'
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
// 查询消息配置
export const getConfigInfo = (method, data) =>
  request({
    url: `/api/bracing/message/getConfigInfo?businessType=${data}`,
    method: method,
  });
// 消息场景接收配置详情
export const sceneReceive = (method, code) =>
  request({
    url: `/api/message2/sat-msg-scene-receive/code/${code}`,
    method: method,
  }); 
// 添加消息配置
export const addConfig = (method, data) =>
  request({
    url: `/api/bracing/message/addConfig`,
    method: method,
    data
  });
  // 消息场景接收配置详情
  export const getSceneReceive = (code) =>
    request({
      url:`/api/message2/sat-msg-scene-receive/code/${code}`,
      method: 'get',
    })

    export const tenantUserList = (params, method = "get") => {
      return request({
        url:"/api/ouaa" + "/authenticated/user-under-tenant/page",
        method: method,
        params: {
          ...params,
          enabled: true,
        },
      });
    }