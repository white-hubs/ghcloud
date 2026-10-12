import request from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/request";

let baseURL = "/api/maintain";

// 委外维修单

// 列表
export const repairList = (params, method) =>
  request({
    url: baseURL + `/outsource/apply/personal`,
    method: method,
    params,
  })
export const importDevice = (params, method) =>
  request({
    url: baseURL + `/outsource/device/import`,
    method: 'post',
    params,
  })

// 新增
export const repairListAdd = (data, method) =>
  request({
    url: baseURL + `/outsource/repair/application/receipt`,
    method: method,
    data,
  })

// 详情,删除
export const repairListId = (params, method) =>
  request({
    url: baseURL + `/outsource/repair/application/receipt/${params?.id ? params.id : params}`,
    method: method,
    params,
  })


// 确认
export const repairListConfirm = (data, method) =>
  request({
    url: baseURL + `/outsource/repair/application/confirm`,
    method: method,
    data,
  })

// 三个流程
export const repairListIdPro = (params, method) =>
  request({
    url: baseURL + `/retrofit/receipt/event-line`,
    method: method,
    params,
  })

// 委外维修工单

// 列表
export const repairOrderList = (params, method) =>
  request({
    url: baseURL + `/outsource/repair/ticket/page`,
    method: method,
    params,
  })

// 详情
export const repairOrderId = (params, method) =>
  request({
    url: baseURL + `/outsource/repair/ticket/${params?.id ? params.id : params}`,
    method: method,
    params,
  })

// 评价
export const repairOrderEval = (data, method) =>
  request({
    url: baseURL + `/outsource/repair/ticket/assessment`,
    method: method,
    data,
  })

// 获取评价
export const getAssessmentInfo = (params, method) =>
  request({
    url: baseURL + `/outsource/repair/ticket/assessment`,
    method: method,
    params,
  })

// 业务配置

// 公司
export const repairCompany = (params, method) =>
  request({
    url: baseURL + `/outsource/company/list`,
    method: method,
    params,
  })

// 公司详情,删除
export const repairCompanyId = (params, method) =>
  request({
    url: baseURL + `/outsource/company/${params?.id ? params.id : params}`,
    method: method,
    params,
  })

// 公司详情
export const repairCompanyAdd = (data, method) =>
  request({
    url: baseURL + `/outsource/company`,
    method: method,
    data,
  })

// 公司详情
export const repairCompanyEdit = (data, method) =>
  request({
    url: baseURL + `/outsource/company/change`,
    method: method,
    data,
  })

// 模式
export const repairMode = (params, method) =>
  request({
    url: baseURL + `/outsource/model/list`,
    method: method,
    params,
  })

// 模式新增
export const repairModeAdd = (data, method) =>
  request({
    url: baseURL + `/outsource/model`,
    method: method,
    data,
  })

// 模式编辑,删除
export const inspectCycleId = (params, method) =>
  request({
    url: baseURL + `/outsource/model/${params?.id ? params.id : params}`,
    method: method,
    params,
  })


// 设备
export const repairDevice = (data, method) =>
  request({
    url: baseURL + `/outsource/device/list`,
    method: 'get',
    params:data,
  })

// 移除
export const repairDeviceRemove = (params, method) =>
  request({
    url: baseURL + `/outsource/device/instance/${params?.id ? params.id : params}`,
    method: method,
    params,
  })

// 新增
export const repairDeviceAdd = (data, method) =>
  request({
    url: baseURL + `/outsource/device/instance`,
    method: method,
    data,
  })

// 通知方式枚举
export const messageEnum = (data, method) =>
  request({
    url: baseURL + `/outsource/receipt/confirm-user/notify-channels`,
    method: method,
    data,
  })

// 获取配置
export const getRenovConfig = (data, method) =>
  request({
    url: baseURL + `/outsource/receipt/confirm-user`,
    method: method,
    data,
  })

// 保存配置
export const outSourceConfig = (data, method) =>
  request({
    url: baseURL + `/outsource/receipt/collocate-confirm-user`,
    method: method,
    data,
  })
  /**
   * 批量删除
   */
export const deleteDeviceBatch = (data, method) =>
  request({
    url: baseURL + `/outsource/device/batchRemove`,
    method: 'post',
    data,
  })
export const deleteSecurityDevice = (id, method) =>
  request({
    url: baseURL + `/outsource/device/instance/${id}`,
    method: 'delete',
  
  })