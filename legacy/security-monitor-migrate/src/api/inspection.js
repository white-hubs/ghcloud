import request from "@/utils/request";
let baseURL = "/api/maintain";
// if (process.env.NODE_ENV === "loc") {
//   baseURL = "http://192.168.2.102:3200/maintain";
// }

// 巡检计划

// 巡检计划分页
export const inspectPlan = (params, method) =>
  request({
    url: baseURL + "/inspect-plan/page",
    method: method,
    params,
  });

// 巡检计划详情
export const inspectPlanId = (data, method) =>
  request({
    url: baseURL + "/inspect-plan/" + (data.id ? data.id : data),
    method: method,
    data,
  });

// 巡检计划新增
export const inspectPlanAdd = (data, method = "post") =>
  request({
    url: baseURL + "/inspect-plan",
    method: method,
    data,
  });

// 巡检计划状态修改
export const inspectPlanStatus = (data, method = "post") =>
  request({
    url: baseURL + `/inspect-plan/${data.id}/start/${data.startFlag}`,
    method: method,
    data,
  });

// 巡检任务

// 巡检任务分页
export const inspectTask = (params, method) =>
  request({
    url: baseURL + "/inspect-task/page",
    method: method,
    params,
  });

// 我的巡检任务分页
export const myInspectTask = (data, method) =>
  request({
    url: baseURL + "/inspect-task/mytask",
    method: method,
    data,
  });

// 巡检任务详情
export const inspectTaskId = (data, method) =>
  request({
    url: baseURL + "/inspect-task/" + (data.id ? data.id : data),
    method: method,
    data,
  });

// 巡检任务启停
export const taskStatus = (data, method) =>
  request({
    url: baseURL + "/inspect-task/" + (data.id ? data.id : data) + '/stop',
    method: method,
    data,
  });

// 巡检台账

// 分页
export const inspectAccount = (params, method) =>
  request({
    url: baseURL + `/inspect-record/page`,
    method: method,
    params,
  });

// 详情
export const inspectAccountId = (data, method) =>
  request({
    url: baseURL + `/inspect-record/${data.id ? data.id : data}`,
    method: method,
    data,
  });

// 巡检配置

// 巡检周期分页
export const inspectCycle = (params, method) =>
  request({
    url: baseURL + `/inspect-cron/page`,
    method: method,
    params,
  });

// 巡检周期列表
export const inspectCycleList = (data, method) =>
  request({
    url: baseURL + `/inspect-cron/list`,
    method: method,
    data,
  });

// 巡检周期--新增
export const inspectCycleAdd = (data, method) =>
  request({
    url: baseURL + `/inspect-cron`,
    method: method,
    data,
  });

// 巡检周期--详情,删除,修改
export const inspectCycleId = (data, method) =>
  request({
    url: baseURL + `/inspect-cron/${data.id ? data.id : data}`,
    method: method,
    data,
  });

// 巡检周期--批量删除
export const inspectCycleBatch = (params, method) =>
  request({
    url: baseURL + `/inspect-cron/batch`,
    method: method,
    params,
  });

// 巡检结果

// 巡检结果分页
export const inspectResult = (params, method) =>
  request({
    url: baseURL + `/inspect-result/page`,
    method: method,
    params,
  });

// 巡检结果列表
export const inspectResultList = (data, method) =>
  request({
    url: baseURL + `/inspect-result/list`,
    method: method,
    data,
  });

// 巡检结果新增
export const inspectResultAdd = (data, method) =>
  request({
    url: baseURL + `/inspect-result`,
    method: method,
    data,
  });

// 巡检结果详情
export const inspectResultId = (data, method) =>
  request({
    url: baseURL + `/inspect-result/${data.id ? data.id : data}`,
    method: method,
    data,
  });

// 巡检结果详情
export const inspectResultOptions = (data, method) =>
  request({
    url: baseURL + `/inspect-result/${data.id ? data.id : data}/options`,
    method: method,
    data,
  });

// 巡检类型

// 分页
export const inspectType = (params, method) =>
  request({
    url: baseURL + `/inspect-type/page`,
    method: method,
    params,
  });

// 列表
export const inspectTypeList = (params, method) =>
  request({
    url: baseURL + `/inspect-type/list`,
    method: method,
    params,
  });

// 详情,编辑
export const inspectTypeId = (data, method) =>
  request({
    url: baseURL + `/inspect-type/${data.id ? data.id : data}`,
    method: method,
    data,
  });

// 新增
export const inspectTypeAdd = (data, method) =>
  request({
    url: baseURL + `/inspect-type`,
    method: method,
    data,
  });

// 巡检标准

// 表格
export const inspectStandard = (params, method = 'get') =>
  request({
    url: baseURL + `/inspect-standard/page`,
    method: method,
    params,
  });

// 列表
export const inspectStandardList = (params, method = 'get') =>
  request({
    url: baseURL + `/inspect-standard/list`,
    method: method,
    params,
  });

// 删除
export const inspectStandardId = (data, method = 'get') =>
  request({
    url: baseURL + `/inspect-standard/${data.id ? data.id : data}`,
    method: method,
    data,
  });

// 批量删除
export const inspectStaBatchDel = (params, method = 'get') =>
  request({
    url: baseURL + `/inspect-standard/batch`,
    method: method,
    params,
  });

// 新增
export const inspectStandardAdd = (data, method = 'post') =>
  request({
    url: baseURL + `/inspect-standard`,
    method: method,
    data,
  });

// 关联标准新增
export const inspectStandardCon = (data, method = 'post') =>
  request({
    url: baseURL + `/inspect-standard/type`,
    method: method,
    data,
  });

