import request from "@/utils/request";
let baseURL = "/api/vmonitor";
// if (process.env.NODE_ENV === "lzy" || process.env.NODE_ENV === "loc") {
//   baseURL = "http://192.168.2.89:3100/vmonitor";
// }

/* 多路视频 */

// 多路视频设备分页列表
export const monitorEquipList = (params, method) =>
  request({
    url: baseURL + "/multiple-video/devices",
    method: method,
    params,
  });

// 多路视频收藏

// 多路视频收藏添加
export const addCollectVideo = (params, method) =>
  request({
    url: baseURL + "/multiple-video-collect",
    method: method,
    params,
  });

// 多路视频收藏修改,详情,删除
export const collectVideoId = (params, method) =>
  request({
    url: baseURL + `/multiple-video-collect/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 多路视频收藏分页
export const collectVideo = (params, method) =>
  request({
    url: baseURL + `/multiple-video-collects`,
    method: method,
    params,
  });

// 视频巡逻路线

// 巡逻路线修改,详情,删除
export const patrolLineId = (params, method) =>
  request({
    url: baseURL + `/camera-patrol-line/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 巡逻路线收藏分页
export const patrolLine = (params, method) =>
  request({
    url: baseURL + `/camera-patrol-lines`,
    method: method,
    params,
  });

// 巡逻路线收藏批量删除
export const patrolLineBatch = (params, method) =>
  request({
    url: baseURL + `/camera-patrol-line/batch?ids=${params.ids}`,
    method: method,
    params,
  });

// 视频巡逻路线

// 视频巡逻路线添加
export const addPatrolLine = (params, method) =>
  request({
    url: baseURL + "/camera-patrol-line",
    method: method,
    params,
  });

// 视频巡逻记录分页列表
export const patrolRecord = (params, method) =>
  request({
    url: baseURL + "/camera-patrol-records",
    method: method,
    params,
  });

// 视频巡逻记录详情
export const patrolRecordId = (params, method) =>
  request({
    url: baseURL + `/camera-patrol-record/${params.id ? params.id : params}`,
    method: method,
    params,
  });
// 视频巡逻报告

// 开始视频巡逻
export const patrolStart = (params, method) =>
  request({
    url: baseURL + `/camera-patrol-record`,
    method: method,
    params,
  });

// 视频巡逻设备记录列表(根据巡逻记录获取)
export const patrolRecordList = (params, method) =>
  request({
    url:
      baseURL +
      `/camera-patrol-record-devices/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 视频巡逻报告提交
export const patrolRepordSub = (params, method) =>
  request({
    url: baseURL + `/camera-patrol-record-device`,
    method: method,
    params,
  });
// 根据区域获取下面摄像机列表
export const getVideoListByArea = (params) =>
  request({
    url: baseURL + `/multiple-video/list-devices`,
    method: "get",
    params,
  });