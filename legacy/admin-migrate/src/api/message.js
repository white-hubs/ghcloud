import request from "@/utils/request";
let baseURL = "/api/message2";

//模板分页列表
export const msgTmpPage = (params) =>
  request({
    url: baseURL + `/msg-tmp/page`,
    method: "get",
    params
  });
//模板新增
export const msgTmpAdd = (params) =>
  request({
    url: baseURL + `/msg-tmp`,
    method: "post",
    params
  });

//租户消息应用列表
export const msgApplications = (params) =>
  request({
    url: baseURL + `/sat-msg-applications`,
    method: "get",
    params
  });
//消息通道列表
export const msgChannels = (params) =>
  request({
    url: baseURL + `/msg-channels`,
    method: "get",
    params
  });

//场景列表
export const sceneList = (params) =>
  request({
    url: baseURL + `/msg-scenes`,
    method: "get",
    params
  });

//模板修改
export const templateUpdate = (id,params) =>
  request({
    url: baseURL + `/msg-tmp/${id}`,
    method: "put",
    params
  });

// 消息记录分页
export const myMessage = (params, method) =>
  request({
    url: baseURL + "/msg-records",
    method: method,
    params,
  });

// 消息记录分页
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
  