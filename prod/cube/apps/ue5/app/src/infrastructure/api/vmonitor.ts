import request from "../service/request";
import { VideoType } from "./models/vmonitor";

const baseURL = "/api/vmonitor/";
/**
 * @说明 摄像机列表
 * @returns
 */
export async function videoListDevices<T extends Record<string, any>>(params: T) {
  return await request<VideoType[]>({
    url: `${baseURL}multiple-video/list-devices`,
    method: "GET",
    params,
  });
}
/**
 * @说明 视频巡逻设备异常记录分页列表
 * @returns
 */
export async function deviceRemarkPage<T extends Record<string, any>>(params: T) {
  return await request<any>({
    url: `${baseURL}camera-patrol-record-device-remark/page`,
    method: "GET",
    params,
  });
}

/**
 * @说明 视频巡逻统计
 */
export async function cameraPatrolStatistics<T extends Record<string, any>>(params?: T) {
  return await request<any>({
    url: `${baseURL}camera-patrol-statistics`,
    method: "GET",
    params,
  });
}
/**
 * @说明 巡逻异常趋势统计
 */
export async function cameraPatrolStatisticsAbnormalTrend<T extends Record<string, any>>(params: T) {
  return await request<any>({
    url: `${baseURL}camera-patrol-statistics/abnormal-trend`,
    method: "GET",
    params,
  });
}
/**
 * @说明 巡逻点位排行top统计
 */
export async function cameraPatrolStatisticsPointTop<T extends Record<string, any>>(params: T) {
  return await request<any>({
    url: `${baseURL}camera-patrol-statistics/point-top`,
    method: "GET",
    params,
  });
}
/**
 * @说明 巡逻时间分布统计
 */
export async function cameraPatrolStatisticsTimeDistribution<T extends Record<string, any>>(params: T) {
  return await request<any>({
    url: `${baseURL}camera-patrol-statistics/time-distribution`,
    method: "GET",
    params,
  });
}
/**
 * @说明 巡逻人员点位统计
 */
export async function cameraPatrolStatisticsCameraPointn<T extends Record<string, any>>(params: T) {
  return await request<any>({
    url: `${baseURL}camera-patrol-statistics/person/camera-point`,
    method: "GET",
    params,
  });
}
/**
 * @说明 巡逻路线
 */
export async function cameraPatrolLines<T extends Record<string, any>>(params: T) {
  return await request<any>({
    url: `${baseURL}camera-patrol-lines`,
    method: "GET",
    params,
  });
}
/**
 * @说明 巡逻路线
 */
export async function cameraPatrolLine(id: string) {
  return await request<any>({
    url: `${baseURL}/camera-patrol-line/${id}`,
    method: "GET",
  });
}
/**
 * @说明 摄像机截图
 */
export async function videoScreenshot<T extends Record<string, any>>(data: T) {
  return await request<any>({
    url: `${baseURL}/camera-ptz/photograph`,
    method: "POST",
    data,
  });
}
/**
 * @说明 摄像机截图Hk
 */
export async function videoScreenshotHK(data: string) {
  return await request<any>({
    url: `/api/videogw/video/${data}/snap-capture`,
    method: "POST",
  });
}
/**
 * @说明 巡逻路线修改
 */
export async function patrolLineId(data: string) {
  return await request<any>({
    url: `${baseURL}/camera-patrol-line/${data}`,
    method: "GET",
  });
}
/**
 * @说明 开始视频巡逻
 */
export async function patrolStart<T extends Record<string, any>>(data: T) {
  return await request<any>({
    url: `${baseURL}/camera-patrol-record`,
    method: "POST",
    data,
  });
}
