import { method } from "lodash-es";

import request from "@/utils/request";
let baseURL = "/api/linkage";

//根据事件获取摄像机动作列表
export const getEventVideo = (params, type) =>
  request({
    url: baseURL + `/event-video/${params.id ? params.id : params}`,
    method: "get",
    params,
  });

//根据事件获取摄像机动作执行附件列表
export const getVideoFilePaths = (params, type) =>
  request({
    url: baseURL + `/event-video-file-paths/${params.id ? params.id : params}`,
    method: "get",
    params,
  });
// 根据事件获取物联设备列表
export const getIotDeviceListByEvent = (params) =>
  request({
    url: baseURL + `/event-iot-device-pros/${params.eventId}`,
    method: "get",
    params,
  });
// 手动控制
export const manualControlIotDevice = (data) =>
  request({
    url: baseURL + `/event-iot-device-pro/ctrl`,
    method: "post",
    data,
  });
//再次推送联动报警
export const repeatPushAlarm = (id) =>
  request({
    url: baseURL + `/rule/re-trigger-event/${id}`,
    method: "get",
  });
//根据事件获取物联设备执行记录
export const getIotDeviceProRecords = (params) =>
  request({
    url: baseURL + `/event-iot-device-pro-records/${params.eventId}`,
    method: "get",
    params,
  });
