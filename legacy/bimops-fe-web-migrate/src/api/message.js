import request from "@/utils/request";

const baseURL = "/api/message2";

/* 消息记录 */

// 消息记录分页
// myMessage
export const myMessage = (params, method) =>
  request({
    url: baseURL + "/msg-records",
    method: method,
    params,
  });

// 消息记录分页
// unReadNum
export const unReadNum = (params, method) =>
  request({
    url:
      baseURL +
      `/msg-record/un-read/total/${
        params.channelType ? params.channelType : params
      }`,
    method: method,
    params,
  });

// 一键已读
// allRead
export const allRead = (params, method) =>
  request({
    url: baseURL + "/msg-record/read-all/CHANNEL_SITE",
    method: "put",
    params,
  });

// 批量已读
// 保留
export const checkedRead = (params, method) =>
  request({
    url:
      baseURL +
      "/msg-record/read-batch?ids=" +
      (params.ids ? params.ids.join(",") : params),
    method: method,
    params,
  });
