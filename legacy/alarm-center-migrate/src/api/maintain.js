import request from "@/utils/request";
let baseURL = "/api/maintain";

// 基础

// 报警级别
export const alarmLevel = (params, method) =>
  request({
    url: baseURL + `/sat-alarm-levels`,
    method: method,
    params,
  })

// 报警级别添加
export const alarmLevelAdd = (data, method) =>
  request({
    url: baseURL + `/sat-alarm-level`,
    method: method,
    data,
  })

// 报警级别详情,修改,删除
export const alarmLevelId = (data, method) =>
  request({
    url: baseURL + `/sat-alarm-level/${data?.id ? data.id : data}`,
    method: method,
    data,
  })

// 仪表管理


// 仪表类型
export const meterType = (params, method) =>
  request({
    url: baseURL + `/enumType/getInstumenttype`,
    method: method,
    params,
  })

// 仪表添加
export const meterAdd = (data, method) =>
  request({
    url: baseURL + `/meter-device/batchAdd`,
    method: method,
    data,
  })

// 分项配置

// 能耗分项
export const energyProject = (params, method) =>
  request({
    url: baseURL + `/energy-project/page`,
    method: method,
    params,
  })

// 能耗分项添加
export const energyProjectAdd = (data, method) =>
  request({
    url: baseURL + `/energy-project`,
    method: method,
    data,
  })

// 能耗分项详情,编辑
export const energyProjectId = (data, method) =>
  request({
    url: baseURL + `/energy-project/${data?.id ? data.id : data}`,
    method: method,
    data,
  })

// 区域分项
export const areaProject = (params, method) =>
  request({
    url: baseURL + `/area-project/page`,
    method: method,
    params,
  })

// 区域分项添加
export const areaProjectAdd = (data, method) =>
  request({
    url: baseURL + `/area-project`,
    method: method,
    data,
  })

// 区域分项详情,编辑
export const areaProjectId = (data, method) =>
  request({
    url: baseURL + `/area-project/${data?.id ? data.id : data}`,
    method: method,
    data,
  })

// 告警配置

// 告警配置分页
export const alarm = (params, method) =>
  request({
    url: baseURL + `/rlarm-rules/page`,
    method: method,
    params,
  })

// 告警配置添加
export const alarmAdd = (params, method) =>
  request({
    url: baseURL + `/rlarm-rules`,
    method: method,
    params,
  })

// 告警配置详情,删除,修改
export const alarmId = (data, method) =>
  request({
    url: baseURL + `/rlarm-rules/${data?.id ? data.id : data}`,
    method: method,
    data,
  })