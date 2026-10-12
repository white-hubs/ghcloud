import request from "@/utils/request";

const baseURL = "/api/mdata";

// 我的企业 - 查询
// tenant
export const tenant = (params, method = "get") =>
  request({
    url: baseURL + "/tenant/mine",
    method: method,
    params,
  });

// 获取流媒体
// 保留
export const getStreamMediaConfig = (params,header) =>
  request({
    url: baseURL + `/stream-media-config`,
    method: "get",
    params,
    header
  });

// 获取登录会话信息
// getVideoPtzSession
export const getVideoPtzSession = (params, method = "get",header) =>
  request({
    url: baseURL + "/video-ptz/login-session",
    method: method,
    params,
    header
  });
