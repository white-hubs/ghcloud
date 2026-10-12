import request from "@/utils/request";
let baseURL = "/api/energymanagement";

// 基础

// 综合能耗
export const compEnergy = (params, method) =>
  request({
    url: baseURL + `/comprehensive-energy/${params?.instrumentType ? params?.instrumentType : params}`,
    method: method,
    params,
  })

// 能耗趋势
export const energyTrend = (params, method) =>
  request({
    url: baseURL + `/energy-trend`,
    method: method,
    params,
  })

// 分项能耗
export const energyItem = (params, method) =>
  request({
    url: baseURL + `/energy-project`,
    method: method,
    params,
  })

// 区域分项
export const energyArea = (params, method) =>
  request({
    url: baseURL + `/energy-erea`,
    method: method,
    params,
  })

// 能耗分析

// 分项菜单列表
export const energyAnalysis = (params, method) =>
  request({
    url: baseURL + `/energy-analysis-menu`,
    method: 'get',
    params,
  })

// 分析总览统计
export const analysisOverview = (params, method) =>
  request({
    url: baseURL + `/energy-analysis-overview`,
    method: method,
    params,
  })

// 能耗分析趋势
export const analysisTrend = (params, method) =>
  request({
    url: baseURL + `/energy-analysis-trend`,
    method: method,
    params,
  })

// 能耗分析采集里历史
export const analysisHistory = (params, method) =>
  request({
    url: baseURL + `/energy-analysis-history`,
    method: method,
    params,
  })

// 抄表周期列表
export const metterReade = (params) =>
  request({
    url: baseURL + `/meter-reade-cycle/page`,
    method: 'get',
    params,
  })

// 抄表周期添加
export const metterReadeAdd = (data, method) =>
  request({
    url: baseURL + `/meter-reade-cycle`,
    method: method,
    data,
  })

// 抄表周期修改
export const metterReadeId = (data, method) =>
  request({
    url: baseURL + `/meter-reade-cycle/${data?.id ? data?.id : data}`,
    method: method,
    data,
  })

// 抄表设备树
export const metterDeviceTree = (data, method) =>
  request({
    url: baseURL + `/meter-device/getReadeTree`,
    method: 'get',
    data,
  })

// 抄表分页
export const metterDevice = (params, method) =>
  request({
    url: baseURL + `/meter-device/getReadeList`,
    method: 'get',
    params,
  })

// 抄表用量修改
export const metterValueEdit = (data, method) =>
  request({
    url: baseURL + `/meter-device/updateReade`,
    method: method,
    data,
  })

// 仪表详情
export const metterDetail = (params, method) =>
  request({
    url: baseURL + `/meter-device/${params.id}/${params.period}`,
    method: method,
  })

// 仪表管理批量删除
export const deleteMeterDevice = (params, method) =>
  request({
    url: baseURL + `/meter-device/batchdelete`,
    method: 'DELETE',
    params,
  })

// 报警配置分页
export const alarmConfig = (data, method) =>
  request({
    url: baseURL + `/rlarm-rules`,
    method: method,
    data,
  })

// 报警配置添加
export const alarmConfigAdd = (data, method) =>
  request({
    url: baseURL + `/rlarm-rules`,
    method: method,
    data,
  })

// 报警配置详情
export const alarmConfigId = (data, method) =>
  request({
    url: baseURL + `/rlarm-rules/${data?.id ? data?.id : data}`,
    method: method,
    data,
  })

// 获取上级仪表
export const parentMetter = (data, method) =>
  request({
    url: baseURL + `/meter-device/getByIdAndCategory/${data?.id ? data?.id : data}/${data?.instrumentType ? data?.instrumentType : data}`,
    method: method,
    data,
  })

// 仪表类型

// 列表
export const meter = (params, method) =>
  request({
    url: baseURL + `/meter-device/page`,
    method: method,
    params,
  })

// 仪表删除
export const meterId = (params, method) =>
  request({
    url: baseURL + `/meter-device/${params?.deviceId ? params?.deviceId : params
      }`,
    method: method,
    params,
  })

// 仪表绑定上级
export const meterParentBind = (params, method) =>
  request({
    url: baseURL + `/meter-device/config/superiorInstrument/${params.id}/${params.parentId}`,
    method: method,
    params,
  })

// 获取拓扑结构
export const getTopoTree = (params, method) =>
  request({
    url: baseURL + `/meter-device/getTree`,
    method: method,
    params,
  })

// 仪表区域列表
export const getDviceAreaArr = (params, method) => request({
  url: baseURL + `/meter-device/getDviceAreaArr/${params?.id || params}`,
  method: method,
})

// 修改报警规则配置状态
export const updateStatus = (params, method) => request({
  url: baseURL + `/rlarm-rules/updateStatus/${params.id}/${params.status}`,
  method: 'put',
})
  

// 设备历史
export const getDeviceHistory = (params, method) =>
  request({
    url: baseURL + `/meter-device/getDeviceHistory`,
    method: 'get',
    params,
  })



// 未导入的设备
export const getMeterDeviceDevices = (params, method) =>
  request({
    url: baseURL + `/meter-device/devices`,
    method: 'get',
    params,
  })


