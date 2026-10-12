import request from '@/utils/request'
let baseURL = '/api/management'

// 知识文档
export const getDeviceKnowledgeFile = (params) =>
  request({
    url:baseURL+'/device-document/device-content/page',
    method:'get',
    params
  })