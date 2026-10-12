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
// 故障类型工单统计
export const getFaultApplyStatistics = (params, method = 'get') =>
  request({
    url: '/api/maintain/fault/apply/statistics/type',
    method: method,
    params
  })
// 故障类型工单统计导出
export const exportFaultApplyStatistics = (params, method = 'get') =>
  request({
    url: '/api/maintain/fault/apply/statistics/typeExcel',
    method: method,
    params
  })

// 根据业务类型获取当前表单流程节点名称
export const getFlowBusinessNodeNames = (params, method = 'get') =>
  request({
    url: '/api/flow/form-flow-business/node/name',
    method: method,
    params
  })
