import request from '@/utils/request'
let baseURL = '/api/device-supervise'
// 获取设备台账列表
export const getEquipmentAccountList = (params) =>
  request({
    url:baseURL+'/device-account/page',
    method:'get',
    params
  })
// 导入设备
export const addEquipmentAccount = (data) =>
  request({
    url:baseURL+'/device-account/batch',
    method:'post',
    data
  })
// 删除设备台账数据
export const deleteEquipmentAccount = (data) =>
  request({
    url:baseURL+`/device-account/${data?.id || data}`,
    method:'delete',
    data
  })
// 批量删除
export const batchDeleteEquipment = (params) =>
  request({
    url:baseURL+`/device-account/batch`,
    method:'delete',
    params
  })
//获取设备台账id
export const getEquipmentAccountIds = (params) =>
  request({
    url:baseURL+`/device-account/deviceIds`,
    method:'get',
    params
  })
// 生命事件类型
export const getEquipmentLifeEventTypes = (params) =>
  request({
    url:baseURL+`/device-life-events/types`,
    method:'get',
    params
  })

// 生命事件
export const getEquipmentLifeEvent = (params) =>
  request({
    url:baseURL+`/device-life-events/page`,
    method:'get',
    params
  })


// 设备健康分析分页列表
export const getHealthyAnalysis = (params) =>
  request({
    url:baseURL+'/device/instance/analysis/health/page',
    method:'get',
    params
  })
// 设备健康预警
export const getHealthyAlarm = (params) =>
  request({
    url:baseURL+'',
    method:'get',
    params
  })
// 设备健康分析
export const getHealthProblems = (params) =>
  request({
    url:baseURL+`/device/instance/analysis/health/problems/latest/${params.id}`,
    method:'get',
    params
  })
// 历史健康分析值分页
export const historyHealthVlaue = (params) =>
  request({
    url:baseURL+`/device/instance/analysis/health/historical/page`,
    method:'get',
    params
  })
// 历史健康趋势
export const historyHealthTrend = (params) =>
  request({
    url:baseURL+`/device/instance/analysis/health/trend`,
    method:'get',
    params
  })
// 设备健康报警配置预览
export const getDeviceHealthyAlarmConfigList = (params) =>
  request({
    url:baseURL+`/device/instance/alarm/health/config/page`,
    method:'get',
    params
  })
// 配置健康报警规则
export const configDeviceHealthAlarm = (data) =>
  request({
    url:baseURL+`/device/instance/${data.deviceInstanceId}/alarm/health/config`,
    method:'post',
    data
  })
// 获取设备健康报警配置
export const getDeviceHealthAlarmConfig = (params) =>
  request({
    url:baseURL+`/device/instance/${params}/alarm/health/config`,
    method:'get',
  })
// 启用报警规则
export const updateHealthAlarmConfigSwitch = (params) =>
  request({
    url:baseURL+`/device/instance/${params.deviceInstanceId}/alarm/health/config/enable`,
    method:'put',
    params
  }) 
// 设备可靠性分析
export const deviceReliabilityAnalysis = (params) =>
  request({
    url:baseURL+`/device/instance/analysis/reliability`,
    method:'get',
    params
  }) 
// 重新检测
export const retestCheck = (data) =>
  request({
    url:baseURL+`/device/instance/${data.deviceInstanceId}/analysis/health/computing`,
    method:'post',
    data
  })
// 设备退役
export const decommissioning = (params) =>
  request({
    url:baseURL+`/device-account/${params?.id??params}/decommissioning`,
    method:'post',
  })
// 设备报废
export const scrapping = (params) =>
  request({
    url:baseURL+`/device-account/${params?.id??params}/scrapping`,
    method:'post',
  })

  // 设备详情
export const getDeviceAccount = (params) =>
request({
  url:baseURL+`/device-account/${params?.id??params}`,
  method:'get',
}) 

// 设备劣势分析
export const disadvantageAnalysis = (deviceInstanceId) =>
  request({
    url:baseURL+`/device/instance/${deviceInstanceId}/analysis/health/degradation/trend`,
    method:"get"
  })