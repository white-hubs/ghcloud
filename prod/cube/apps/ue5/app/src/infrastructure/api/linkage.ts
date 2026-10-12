import axios from "axios";

import request from "../service/request";
import { EventVideo } from "./models/linkage";
const baseURL = "/api/linkage";
//根据事件获取摄像机动作列表
export function getEventVideo<T extends string>(id: T) {
  return request<EventVideo[]>({
    url: `${baseURL}/event-video/${id}`,
    method: "GET",
  });
}
//根据事件获取摄像机动作列表深农获取二级市场数据
export function getEventVideoSn<T extends string>(url, id: T, headers) {
  return request<EventVideo[]>({
    url: `${url + baseURL}/event-video/${id}`,
    method: "GET",
    headers,
  });
}
//根据事件获取摄像机动作执行附件列表
export function getVideoFilePaths<T extends string>(params) {
  return request<EventVideo[]>({
    url: `${baseURL}/event-video-file-paths/${params.id ? params.id : params}`,
    method: "GET",
  });
}
export function getIotDeviceListByEvent<T extends string>(params) {
  return request<EventVideo[]>({
    url: `${baseURL}/event-iot-device-pros/${params.eventId}`,
    method: "GET",
  });
}
export function manualControlIotDevice<T extends string>(data) {
  return request<EventVideo[]>({
    url: `${baseURL}/event-iot-device-pro/ctrl`,
    data,
    method: "POST",
  });
}
export function getIotDeviceProRecords<T extends string>(params) {
  return request<EventVideo[]>({
    url: `${baseURL}/event-iot-device-pro-records/${params.eventId}`,
    method: "GET",
  });
}

//根据事件获取摄像机动作执行附件列表
export function getVideoFilePathsSn<T extends string>(params, url) {
  return request<EventVideo[]>({
    url: `${url}${baseURL}/event-video-file-paths/${params.id ? params.id : params}`,
    method: "GET",
  });
}
