import request from "@/utils/request.js"
let baseURL = "/api/maintain";

// 维保计划

// 列表
export const maintenancePlan = (params, method) =>
  request({
    url: baseURL + `/select-maintenance-plan`,
    method: method,
    params,
  })

// 列表
export const maintenanceStatus = (params, method) =>
  request({
    url: baseURL + `/getStatus`,
    method: method,
    params,
  })

// 详情
export const maintenancePlanId = (params, method) =>
  request({
    url: baseURL + `/select-maintenance-planDetail/${params.id ? params.id : params}`,
    method: method,
    params,
  })

// 新增
export const maintenancePlanAdd = (data, method) =>
  request({
    url: baseURL + `/save-maintenance-plan`,
    method: method,
    data,
  })

// 状态
export const maintenancePlanStatus = (params, method) =>
  request({
    url: baseURL + `/update-maintenance-plan`,
    method: method,
    params,
  })

// 新增
export const maintenancePlanDel = (params, method) =>
  request({
    url: baseURL + `/delete-plan/${params.id ? params.id : params}`,
    method: method,
    params,
  })

// 维保任务

// 列表
export const maintenanceTask = (params, method) =>
  request({
    url: baseURL + `/select-tasks`,
    method: method,
    params,
  })

// 详情
export const maintenanceTaskId = (params, method) =>
  request({
    url: baseURL + `/select-tasks-detail/${params?.id ? params?.id : params}`,
    method: method,
    params,
  })

// 维保结果记录新增
export const saveProgetRecord = (data) =>
  request({
    url: baseURL + `/save-proget-record`,
    method: "POST",
    data,
  })

// 列表
export const maintenanceTerm = (params, method) =>
  request({
    url: baseURL + `/select-maintenance-project`,
    method: method,
    params,
  })

// 配置
export const maintenanceTermOperate = (data, method) =>
  request({
    url: baseURL + `/save-maintenance-project`,
    method: method,
    data,
  })

// 配置详情
export const maintenanceTermDetail = (params, method = 'get') =>
  request({
    url: baseURL + `/select-maintenance-projectDetail`,
    method: method,
    params,
  })


// 维保统计
export const maintenanceDeviceStatistics = (params, method) =>
  request({
    url: baseURL + `/maintenance/device/statistics/page`,
    method: method,
    params,
  })

/**获取岗位 */
export const appointmentList = (params, method = "get") =>
  request({
    url: "/api/ouaa/appointment/list",
    method: method,
    params,
  });
