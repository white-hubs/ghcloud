import request from '@/utils/request'
let baseURL = '/api/message'
// 平台消息通道配置列表
export const getMsgChannelConfigs = (params) =>
  request({
    url: baseURL + `/sat-msg-configs/channel/${params.satMsgDefineCode}`,
    method: 'get',
    params
  })
  
  // 消息场景接收配置详情
  export const getSceneReceive = (code) =>
    request({
      url:`/api/message2/sat-msg-scene-receive/code/${code}`,
      method: 'get',
    })