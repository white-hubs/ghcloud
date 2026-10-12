import request from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/request";
let baseURL = "/api/maintain";

// 隐患单

// 列表
export const hiddenDanger = (params, method) =>
  request({
    url: baseURL + `/new/hidden-danger/page`,
    method: method,
    params,
  })

// // 列表
// export const hiddenDanger = (params, method) =>
//   request({
//     url: baseURL + `/hidden-danger/page`,
//     method: method,
//     params,
//   })

// 新增
export const hiddenDangerAdd = (data, method) =>
  request({
    url: baseURL + `/hidden-danger`,
    method: method,
    data,
  })

// 详情
export const hiddenDangerId = (data, method) =>
  request({
    url: baseURL + `/new/hidden-danger/${data.id ? data.id : data}`,
    method: method,
    data,
  })

// 删除
export const hiddenDangerDel = (data, method) =>
  request({
    url: baseURL + `/hidden-danger/${data.id ? data.id : data}`,
    method: method,
    data,
  })

// 根据隐患单主键获取隐患单确认信息
export const hiddenDangerConfInfo = (data, method) =>
  request({
    url: baseURL + `/hidden-danger-confirm/${data.id ? data.id : data}/hidden-danger`,
    method: method,
    data,
  })

// 根据隐患单主键获取隐患单关闭信息
export const hiddenDangerCloseInfo = (data, method) =>
  request({
    url: baseURL + `/hidden-danger-closed/${data.id ? data.id : data}/hidden-danger`,
    method: method,
    data,
  })

// 确认
export const hiddenDangerConfirm = (data, method) =>
  request({
    url: baseURL + `/hidden-danger/${data.hiddenDangerId ? data.hiddenDangerId : data}/confirm`,
    method: method,
    data,
  })

// 关闭
export const hiddenDangerClose = (data, method) =>
  request({
    url: baseURL + `/hidden-danger/${data.hiddenDangerId ? data.hiddenDangerId : data}/closed`,
    method: method,
    data,
  })

// 隐患工单

// 列表
export const hiddenDangerOrder = (params, method) =>
  request({
    url: baseURL + `/hidden-danger/ticket/page`,
    method: method,
    params,
  })

// 工单流程
export const process = (params, method) =>
  request({
    url: baseURL + `/process/node/event`,
    method: method,
    params,
  })

// // 工单流程表单
// export const processForm = (data, method = 'get') =>
//   request({
//     url: baseURL + `/form-value/event/${data.eventId ? data.eventId : data
//       }`,
//     method: method,
//     data,
//   })

// // 工单流程输入表单
// export const processInputForm = (params, method = 'get') =>
//   request({
//     url: baseURL + `/form/task/${params.id ? params.id : params
//       }`,
//     method: method,
//     params,
//   })

// // 工单流程输入表单处理
// export const processComplete = (data, method = 'get') =>
//   request({
//     url: baseURL + `/user-tasks/complete`,
//     method: method,
//     data,
//   })

// 详情
export const hiddenDangerOrderId = (data, method) =>
  request({
    url: baseURL + `/hidden-danger/${data.id ? data.data : data}/ticketId`,
    method: method,
    data,
  })

// 处理
export const hiddenDangerOrderDeal = (data, method) =>
  request({
    url: baseURL + `/hidden-danger/${data.id ? data.data : data}/confirm`,
    method: method,
    data,
  })

// 关闭
export const hiddenDangerOrderClose = (data, method) =>
  request({
    url: baseURL + `/hidden-danger/${data.id ? data.data : data}/closed`,
    method: method,
    data,
  })

// 隐患程度

// 列表
export const dangerDegree = (data, method) =>
  request({
    url: baseURL + `/hidden-danger-level/list`,
    method: method,
    data,
  })

// 新增
export const dangerDegreeAdd = (data, method) =>
  request({
    url: baseURL + `/hidden-danger-level`,
    method: method,
    data,
  })

// 编辑 删除
export const dangerDegreeId = (data, method) =>
  request({
    url: baseURL + `/hidden-danger-level/${data.id ? data.id : data}`,
    method: method,
    data,
  })

// 隐患类型

// 分类

// 列表
export const dangerCategory = (params, method) =>
  request({
    url: baseURL + `/hidden-danger-category/list`,
    method: method,
    params,
  })

// 新增
export const dangerCategoryAdd = (data, method) =>
  request({
    url: baseURL + `/hidden-danger-category`,
    method: method,
    data,
  })

// 编辑 删除
export const dangerCategoryId = (data, method) =>
  request({
    url: baseURL + `/hidden-danger-category/${data.id ? data.id : data}`,
    method: method,
    data,
  })

// 类别

// 列表
export const dangerType = (params, method) =>
  request({
    url: baseURL + `/hidden-danger-type/list`,
    method: method,
    params,
  })

// 新增
export const dangerTypeAdd = (data, method) =>
  request({
    url: baseURL + `/hidden-danger-type`,
    method: method,
    data,
  })

// 编辑 删除
export const dangerTypeId = (data, method) =>
  request({
    url: baseURL + `/hidden-danger-type/${data.id ? data.id : data}`,
    method: method,
    data,
  })

// 隐患配置

// 通知方式枚举
export const dangerNoticeMethod = (data, method) =>
  request({
    url: baseURL + `/hidden-danger-config/notice/list`,
    method: method,
    data,
  })

// 隐患业务配置
export const dangerTrafConf = (data, method) =>
  request({
    url: baseURL + `/hidden-danger-config/batch`,
    method: method,
    data,
  })

// 隐患业务配置列表
export const dangerTrafConfList = (data, method = 'get') =>
  request({
    url: baseURL + `/hidden-danger-config/list`,
    method: method,
    data,
  })

