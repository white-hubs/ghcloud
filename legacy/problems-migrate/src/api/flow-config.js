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
    url: '/api/maintain/hidden/apply/personal',
    method: method,
    params
  })

// 获取流程表格数据 所有
export const getFlowProcessPageAll = (params, method = 'get') =>
  request({
    url: '/api/maintain/hidden/apply/all',
    method: method,
    params
  })

// 个人发起工单统计
export const getWordOrderStatisticsByUser = (params, method = 'get') =>
  request({
    url: '/api/flow/getWordOrderStatisticsByUser',
    method: method,
    params
  })
// 个人工单统计导出
export const exportWordOrderStatisticsByUser = (params, method = 'get') =>
  request({
    url: '/api/flow/exportWordOrderStatisticsByUser',
    method: method,
    params
  })

// 隐患单工单统计
export const getHiddenOrderStatistics = (params, method = 'get') =>
  request({
    url: '/api/maintain/hidden/work/order/statistics',
    method: method,
    params
  })
// 隐患单工单统计导出
export const exportHiddenOrderStatistics = (params, method = 'get') =>
  request({
    url: '/api/maintain/hidden/work/order/statisticsExcel',
    method: method,
    params
  })

