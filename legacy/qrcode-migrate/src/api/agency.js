import request from "@/utils/request";
let baseURL = "/api/todo";

// 待办
export const todo = params =>
  request({
    url: baseURL + `/todo-tasks`,
    method: "get",
    params,
  });

// 已办
export const done = params =>
  request({
    url: baseURL + `/todo-tasks-done`,
    method: "get",
    params,
  });

// 业务来源
export const trafficFrom = data =>
  request({
    url: baseURL + `/todo-task-tags`,
    method: "get",
    data,
  });

// 已办业务来源
export const trafficDoneFrom = data =>
  request({
    url: baseURL + `/todo-done-task-tags`,
    method: "get",
    data,
  });

// 待办数量
export const todoNum = data =>
  request({
    url: baseURL + `/todo-task-statistics`,
    method: "get",
    data,
  });

// 待办任务
// /todo-task-tag-statistics
export const todoTask = data =>
  request({
    url: baseURL + `/todo-task-tag-statistics`,
    method: "get",
    data,
  });

// 待办趋势
export const todoTrend = data =>
  request({
    url: baseURL + `/todo-task-statistics/last-thirty-days-trend`,
    method: "get",
    data,
  });
