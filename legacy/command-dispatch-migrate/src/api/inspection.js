import request from "@/utils/request";
let baseURL = "/api/inspect";

// 巡检计划

// 巡检计划添加
export const addInspectPlan = (params, method) =>
  request({
    url: baseURL + "/inspect-task/add",
    method: method,
    params,
  });

// 巡检计划分页
export const inspectPlan = (params, method) =>
  request({
    url: baseURL + "/inspect-task/page",
    method: method,
    params,
  });

// 巡检计划详情
export const inspectPlanId = (params, method) =>
  request({
    url: baseURL + "/inspect-task/" + (params.id ? params.id : params),
    method: method,
    params,
  });

// 巡检计划状态
export const inspectPlanStatus = (params, method = "post") =>
  request({
    url: baseURL + "/inspect-task/" + params.id + "/start/" + params.startFlag,
    method: method,
    params,
  });

// 巡检计划等级
export const inspectPlanLevel = (params, method = "post") =>
  request({
    url: baseURL + "/inspect/task/level",
    method: method,
    params,
  });

// 巡检类型或巡检标准

// 巡检类型/标准分页
export const inspectPage = (params, method) =>
  request({
    url: baseURL + "/inspect-category/page",
    method: method,
    params,
  });

// 巡检周期

// 巡检周期分页
export const inspectCycle = (params, method) =>
  request({
    url: baseURL + "/inspect-cron/page",
    method: method,
    params,
  });
