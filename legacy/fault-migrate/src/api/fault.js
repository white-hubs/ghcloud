import request from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/request";
import { getCurrentApplicationCode } from "@/hooks/useCurrentApplication";

let baseURL = "/api/maintain";
// 工单流程
export const process = (params, method) =>
  request({
    url: baseURL + `/process/node/event`,
    method: method,
    params,
  })
// 工单流程输入表单
export const processInputForm = (params, method = 'get') =>
  request({
    url: `/api/process/form/task/${params.id ? params.id : params
      }`,
    method: method,
    params,
  })
  export const processComplete = (data, method = 'get') =>
  request({
    url: `/api/process/user-tasks/complete`,
    method: method,
    data,
  })
  export const processList = (params, method) =>
  request({
    url: `/api/process/process-definition/list`,
    method: method,
    params,
  })
// 故障单
export const faultList = (params, method) =>
  request({
    url: baseURL + `/new/fault/page`,
    method: method,
    params,
  })

// 故障单提交
export const faultAdd = (data, method) =>
  request({
    url: baseURL + `/fault`,
    method: method,
    data,
  })

// 故障单删除
export const faultId = (data, method) =>
  request({
    url: baseURL + `/fault/${data.id ? data.id : data}`,
    method: method,
    data,
  })

// 故障单删除
export const faultDetailId = (data, method) =>
  request({
    url: baseURL + `/new/fault/${data.id ? data.id : data}`,
    method: method,
    data,
  })

// 故障单确认
export const faultConfirm = (data, method) =>
  request({
    url: baseURL + `/fault/${data.faultId ? data.faultId : data}/confirm`,
    method: method,
    data,
  })

// 故障单确认信息
export const faultConfInfo = (data, method) =>
  request({
    url: baseURL + `/fault-confirm/${data.id ? data.id : data}/fault`,
    method: method,
    data,
  })


// 故障工单

// 表格
export const faultOrderList = (params, method = 'get') =>
  request({
    url: baseURL + `/fault/ticket/page`,
    method: method,
    params,
  })

// 详情
export const faultOrderDetail = (data, method) =>
  request({
    url: baseURL + `/fault/${data.id ? data.id : data}/ticketId`,
    method: method,
    data,
  })

// 关闭信息
export const faultOrderCloInfo = (data, method) =>
  request({
    url: baseURL + `/fault-closed/${data.id ? data.id : data}/fault`,
    method: method,
    data,
  })

// 关闭信息
export const faultOrderClose = (data, method) =>
  request({
    url: baseURL + `/fault/${data.faultId ? data.faultId : data}/closed`,
    method: method,
    data,
  })

// 故障配置

// 故障类型

// 表格
export const faultType = (params, method) => {
  params.applicationCode = getCurrentApplicationCode()
  return  request({
    url: baseURL + `/fault-type/list`,
    method: method,
    params,
  })
}

// 新增
export const faultTypeAdd = (data, method) => {
  data.applicationCode = getCurrentApplicationCode()
  return  request({
    url: baseURL + `/fault-type`,
    method: method,
    data,
  })
}


export const faultTypeId = (data, method) => {
  return request({
    url: baseURL + `/fault-type/${data.id ? data.id : data}`,
    method: method,
    data,
  })
}

// 故障案例

// 表格
export const faultCase = (params, method) =>{
  params.applicationCode = getCurrentApplicationCode()
  return request({
    url: baseURL + `/fault-case/page`,
    method: method,
    params,
  })
}

// 添加
export const faultCaseAdd = (data, method) =>
  request({
    url: baseURL + `/fault-case`,
    method: method,
    data,
  })

// 近12月统计
export const recentMonth = (data, method) =>
  request({
    url: baseURL + `/get-fault-trend/${data?.id ? data.id : data}`,
    method: method,
    data,
  })

// 删除
export const faultCaseId = (data, method) =>
  request({
    url: baseURL + `/fault-case/${data.id ? data.id : data}`,
    method: method,
    data,
  })

// 设备下的案例
export const caseUnderDevice = (params, method) =>{
  params.applicationCode = getCurrentApplicationCode()
  return request({
    url: baseURL + `/fault-case/device-type/list`,
    method: method,
    params,
  })
}

// 故障频次
export const faultTimes = (params, method) =>
  request({
    url: baseURL + `/fault-case/${params?.id ? params.id : params}/fault`,
    method: method,
    params,
  })


// 业务配置获取
export const faultTraffic = (data, method) =>
  request({
    url: baseURL + `/fault-config/list`,
    method: method,
    data,
  })

// 业务配置配置
export const faultTrafficSet = (data, method) =>
  request({
    url: baseURL + `/fault-config`,
    method: method,
    data,
  })

// 业务配置配置
export const dangerNoticeMethod = (data, method) =>
  request({
    url: baseURL + `/fault-config/notice/list`,
    method: method,
    data,
  })

// 报告分页
export const getReport = (params, method) => {
  params.applicationCode = getCurrentApplicationCode()
  return request({
    url: baseURL + `/getReport`,
    method: 'get',
    params,
  })
}

// 故障报告信息详情
export const getReportOverview = (params, method) =>
  request({
    url: baseURL + `/getReportOverview/${params?.id??params}`,
    method: 'get',
    params,
  })

// 报告新增
export const addReport = (data, method) =>{
  data.applicationCode = getCurrentApplicationCode()
  return  request({
    url: baseURL + `/addReport`,
    method: 'post',
    data,
  })
}

// 报告删除
export const deleteReport = (params, method) =>
  request({
    url: baseURL + `/deleteReport/${params?.id??params}`,
    method: 'delete',
  })

// 报告类型获取
export const getReportType = (params, method) => {
  params.applicationCode = getCurrentApplicationCode()
  return request({
    url: baseURL + `/getReportType`,
    method: 'get',
  })
}

export const getDept = (params, method = 'get') =>
  request({
    url: '/api/ouaa/authenticated/organizations/list',
    method: method,
    params
  })
