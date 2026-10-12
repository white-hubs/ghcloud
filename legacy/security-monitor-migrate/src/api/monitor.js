import request from "@/utils/request";
let baseURL = "/api/vmonitor";

/* 多路视频 */

// 多路视频设备分页列表
export const monitorEquipList = params =>
  request({
    url: baseURL + "/multiple-video/devices",
    method: "get",
    params,
  });
export const monitorEquiptreeList = params =>
  request({
    url: baseURL + "/multiple-video/area-tree-devices",
    method: "get",
    params,
  });

// 多路视频收藏

// 多路视频收藏添加
export const addCollectVideo = (method, data) =>
  request({
    url: baseURL + "/multiple-video-collect",
    method: method,
    data,
  });

// 多路视频收藏修改,详情,删除
export const collectVideoId = (method, params) =>
  request({
    url: baseURL + `/multiple-video-collect/${params.id ? params.id : params}`,
    method: method,
    params,
  });
// 修改多路视频
export const editCollectVideo = data =>
  request({
    url: baseURL + `/multiple-video-collect/${data.id}`,
    method: "put",
    data,
  });

// 多路视频收藏分页
export const collectVideo = (method, params) =>
  request({
    url: baseURL + `/multiple-video-collects`,
    method: method,
    params,
  });

// 视频巡逻路线

// 巡逻路线修改,详情,删除
export const patrolLineId = (data, method) => {
  return request({
    url: baseURL + `/camera-patrol-line/${data.id ? data.id : data}`,
    method: method,
    data,
  });
}
export const editPatrolLine = data =>
  request({
    url: baseURL + `/camera-patrol-line/${data.id}`,
    method: "put",
    data,
  });
//修改巡逻线路状态
export const editPatrolLineState = (id, enabled) =>
  request({
    url: baseURL + `/camera-patrol-line/${id}/${enabled}`,
    method: "put",
  });
// 巡逻路线分页
export const patrolLine = params =>
  request({
    url: baseURL + `/camera-patrol-lines`,
    method: "get",
    params,
  });
// 获取巡逻路线
export const xlLine = params =>
  request({
    url: baseURL + `/camera-patrol-line/list`,
    method: "get",
    params,
  });

// 巡逻路线收藏批量删除
export const patrolLineBatch = params =>
  request({
    url: baseURL + `/camera-patrol-line/batch`,
    method: "delete",
    params,
  });

// 视频巡逻路线

// 视频巡逻路线添加
export const addPatrolLine = (data, method) =>
  request({
    url: baseURL + "/camera-patrol-line",
    method: method,
    data,
  });

// 视频巡逻记录分页列表
export const patrolRecord = params =>
  request({
    url: baseURL + "/camera-patrol-records",
    method: "get",
    params,
  });

// 视频巡逻记录详情
export const patrolRecordId = params =>
  request({
    url: baseURL + `/camera-patrol-record/${params.id ? params.id : params}`,
    method: "get",
    params,
  });
// 视频巡逻报告

// 开始视频巡逻
export const patrolStart = (method, data) =>
  request({
    url: baseURL + `/camera-patrol-record`,
    method: method,
    data,
  });

// 视频巡逻设备记录列表(根据巡逻记录获取)
export const patrolRecordList = (method, params) =>
  request({
    url:
      baseURL +
      `/camera-patrol-record-devices/${params.id ? params.id : params}`,
    method: method,
    params,
  });

// 视频巡逻报告提交
export const patrolRepordSub = (method, params) =>
  request({
    url: baseURL + `/camera-patrol-record-device`,
    method: method,
    params,
  });
// 摄像机截图
export const videoScreenshot = data =>
  request({
    url: baseURL + `/camera-ptz/photograph`,
    method: "post",
    data,
  });
export const videoScreenshotHK = data =>
  request({
    url:  `${baseURL}/camera-patrol-record/snap-capture`,
    method: "post",
    data
  });
// 视频巡逻设备异常记录列表(根据巡逻记录获取)
export const getPatrolAbnormalList = params =>
  request({
    url:
      baseURL + `/camera-patrol-record-device-remarks/${params?.id || params}`,
    method: "get",
    params,
  });
// 视频线路统计分页列表
export const cameraPatrolStatistics = params =>
  request({
    url: baseURL + `/camera-patrol-line-statistics/page`,
    method: "get",
    params,
  });
// 巡检线路异常分组统计
export const patrolAbnormalGroup = params =>
  request({
    url: baseURL + `/camera-patrol-line-statistics/group-abnormal`,
    method: "get",
    params,
  });
// 巡逻异常统计
export const patroAbnormalStatustic = params =>
  request({
    url: baseURL + `/camera-patrol-line-statistics/abnormal`,
    method: "get",
    params,
  });
// 巡逻异常数增长率统计
export const abnormalPatrolLineStatistic = params =>
  request({
    url: baseURL + `/camera-patrol-line-statistics/abnormal-growth-rate`,
    method: "get",
    params,
  });

// 视频线路统计列表导出
export const patrolStatisticExport = data =>
  request({
    url: baseURL + `/camera-patrol-line-statistics/list/export`,
    method: "post",
    data,
    responseType: "blob",
  });
// 巡逻记录导出
export const patrolLineRecordStatisticExport = data =>
  request({
    url: baseURL + `/camera-patrol-records/export`,
    method: "post",
    data,
    responseType: "blob",
  });
