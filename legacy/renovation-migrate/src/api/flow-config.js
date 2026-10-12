import request from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/request'


// 获取流程表格数据 通用
export const getFlowProcessPage = (params, method = 'get') =>
  request({
    url: '/flow/process/instance/historical/page',
    method: method,
    params
  })


// 获取流程表格数据 个人
export const getFlowProcessPagePersonal = (params, method = 'get') =>
  request({
    url: '/api/maintain/fault/apply/personal',
    method: method,
    params
  })

// 获取流程表格数据 所有
export const getFlowProcessPageAll = (params, method = 'get') =>
  request({
    url: '/api/maintain/fault/apply/all',
    method: method,
    params
  })

// 更新改造2.0
export const renovationOrderPage = (params, method='get') =>
  request({
    url: '/api/maintain/retrofit-order/page',
    method: method,
    params,
  })

