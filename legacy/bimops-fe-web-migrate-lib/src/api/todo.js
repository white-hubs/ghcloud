import request from "../utils/request";
let baseURL = "/api/todo";

// 待办数量统计
export const getTodoTaskStatistics = (params, method = "get") =>
  request({
    url: baseURL + `/todo-task-statistics`,
    method: "get",
  });

// 待办业务类型统计
export const getTodoTaskStatisticsType = (params, method = "get") =>
  request({
    url: baseURL + `/todo-task-tag-statistics`,
    method: "get",
  });
