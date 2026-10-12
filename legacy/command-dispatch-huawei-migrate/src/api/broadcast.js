import request from "@/utils/request";
let baseURL = "/api/broadcast/";

// 广播模板分页列表
export const broadcastTemplatePage = (params) =>
  request({
    url: `/api/broadcast/broadcast-template/page`,
    method: "get",
    params,
  });
// 广播文本播放
export const playBroadcast = (data) =>
  request({
    url: baseURL + `/broadcast-play/text`,
    method: "post",
    data,
  });
// 循环
export const circulateBroadcast = (data) =>
  request({
    url: baseURL + `/broadcast-play/circulate/text`,
    method: "post",
    data,
  });
export const stopBroadcast = (data) =>
  request({
    url: baseURL + `/broadcast-play/circulate/stop`,
    method: "post",
    data,
  });
