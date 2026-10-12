import request from "@/utils/request";
let baseURL = "/api/sn-meattrade-plugin";

// 理货数据同步分页列表
export const getTallyDataSyncPage = (params,method = "get") =>
  request({
    url: baseURL + "/pork-arrange/push/page",
    method: method,
    params,
  });

// 大白菜理货数据推送状态重置
export const putTallyDataSync = (params,method = "put") =>
  request({
    url: baseURL + "/dbc/pork-arrange-push/status/reset",
    method: "put",
    params,
  });
