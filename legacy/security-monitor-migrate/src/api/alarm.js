import request from "@/utils/request";
let baseURL = "/api/alarm";
let baseURL1 = "/api/vmonitor";
export const patrolLineBatch1 = (params, method) => {
  return request({
    url: baseURL1 + `/camera-patrol-line/batch?ids=${params.ids}`,
    method: method,
  });
}

// 报警记录列表
export const getAlarmRecords = (params, method = "get") =>
  request({
    url: baseURL + "/alarm-records",
    method: method,
    params,
  });
  // 报警记录列表
export const getAlarmCommonRecords = (params, method = "get") =>
  request({
    url: baseURL + "/alarm-records/common-page",
    method: method,
    params,
  });
export const getsecuritydeviceauth = (params, method = "get") =>
  request({
    url: baseURL1 + "/security/device/auth/getPage",
    method: method,
    params,
  });
// 用户监控设备列表
export const getSecurityUserDeviceAuthPage = (params, method = "get") =>
  request({
    url: baseURL1 + "/security/user/device/auth/getPage",
    method: method,
    params,
  });
export const Addsecuritydeviceauth = data =>
  request({
    url: baseURL1 + "/security/device/auth/insert",
    method: "post",
    data,
  });

export const Deletesecuritydeviceauth = params =>
  request({
    url: baseURL1 + `/security/device/auth/delete?userId=${params.userId}&securityDeviceId=${params.securityDeviceId}`,
    method: "delete",
  });
// 解除人员关联(关联设备使用)
export const clearRelatePerson = params =>
  request({
    url: baseURL1 + `/security/auth/batch/delete/users`,
    method: "delete",
    data: params
  });
// 解除设备关联(关联设备使用)
export const clearRelateDevice = params =>
  request({
    url: baseURL1 + `/security/auth/batch/delete/devices`,
    method: "delete",
    data: params
  });
// 获取报警级别
export const getAlarmLevels = params =>
  request({
    url: baseURL + "/sat-alarm-levels",
    method: "get",
    params,
  });
// 报警记录详情
export const alarmRecordDetail = params =>
  request({
    url: baseURL + `/alarm-record/${params?.id || params}`,
    method: "get",
  });
//获取报警流程日志列表
export const getAlarmHandleProcess = params =>
  request({
    url: baseURL + `/alarm-record/operatorLogs/${params.id}`,
    method: "get",
    params,
  });
// 报警状态事件操作列表
export const alarmEventOperates = params =>
  request({
    url: baseURL + `/alarm-record/state-event-operates/${params.id}`,
    method: "get",
    params,
  });
// 报警移交
export const alarmHandelTransfer = data =>
  request({
    url: baseURL + `/alarm-record/transfer/${data.id}`,
    method: "put",
    data,
  });
// 报警处理;/alarm-record/handler/{id}
export const alarmHandelResult = data =>
  request({
    url: baseURL + `/alarm-record/handler/${data.id}`,
    method: "put",
    data,
  });
// 报警挂起
export const alarmHandelSuspend = data =>
  request({
    url: baseURL + `/alarm-record/suspend/${data.id}`,
    method: "put",
    data,
  });
export const alarmHandelAssign = data =>
  request({
    url: baseURL + `/alarm-record/assign/${data.id}`,
    method: "put",
    data,
  });
// 报警事件状态分组统计分页列表
export const getAlarmStatisticByEvent = params =>
  request({
    url: baseURL + `/alarm-statistics/event-status-page`,
    method: "get",
    params,
  });
// 按用户分组统计报警状态分页列表
export const getAlarmStatisticByUser = params =>
  request({
    url: baseURL + `/alarm-statistics/user-status-page`,
    method: "get",
    params,
  });
// 按报警级别统计
export const alarmLevelStatistic = params =>
  request({
    url: baseURL + `/alarm-statistics/level`,
    method: "get",
    params,
  });
// 按区域报警统计
export const alarmAreaStatistic = params =>
  request({
    url: baseURL + `/alarm-statistics/area-group`,
    method: "get",
    params,
  });
// 报警事件分组统计
export const alarmEventStatistic = params =>
  request({
    url: baseURL + `/alarm-statistics/event-group`,
    method: "get",
    params,
  });
// 报警趋势统计
export const alarmEventtrend = params =>
  request({
    url: baseURL + `/alarm-statistics/trend`,
    method: "get",
    params,
  });

// 报警趋势分析
export const alarmTrendAnalysis = params =>
  request({
    url: baseURL + `/alarm-statistics/trend-analysis`,
    method: "get",
    params,
  });
// 报警事件报警分析
export const alarmEventAnalysis = params =>
  request({
    url: baseURL + `/alarm-statistics/event-analysis`,
    method: "get",
    params,
  });
// 报警区域报警分析
export const alarmAreaAnalysis = params =>
  request({
    url: baseURL + `/alarm-statistics/area-analysis`,
    method: "get",
    params,
  });
// 报警处理分析
export const alarmHandelAreaAnalysis = params =>
  request({
    url: baseURL + `/alarm-statistics/user-handler-analysis`,
    method: "get",
    params,
  });
// 报警级别处理效率统计
export const alarmHandelEfficiencyAnalysis = params =>
  request({
    url: baseURL + `/alarm-statistics/level-handler-efficiency-analysis`,
    method: "get",
    params,
  });
// 用户报警处理效率排名前10
export const userHandlerTopAnalysis = params =>
  request({
    url: baseURL + `/alarm-statistics/user-handler-efficiency-top-ten-analysis`,
    method: "get",
    params,
  });
// 用户报警处理效率排名倒数前10
export const userHandlerLastTopAnalysis = params =>
  request({
    url:
      baseURL +
      `/alarm-statistics/user-handler-efficiency-last-top-ten-analysis`,
    method: "get",
    params,
  });
// 报警总数环比率统计
export const alarmTotalStatistic = params =>
  request({
    url: baseURL + `/alarm-statistics/ring-ratio-analysis`,
    method: "get",
    params,
  });
// 报警状态分组统计
export const alarmStatusGroupStatistics = params =>
  request({
    url: baseURL + `/alarm-statistics/status-group`,
    method: "get",
    params,
  });
// 报警事件状态分组列表导出
export const alarmStatisticExport = data =>
  request({
    url: baseURL + `/alarm-statistics/event-status/list/export`,
    method: "post",
    data,
    responseType: "blob",
  });
// 按用户分组统计报警状态列表导出
export const alarmHandelStatisticExport = data =>
  request({
    url: baseURL + `/alarm-statistics/user-status/list/export`,
    method: "post",
    data,
    responseType: "blob",
  });
// 报警记录导出
export const alarmRecordExport = data =>
  request({
    url: baseURL + `/alarm-records/export`,
    method: "post",
    data,
    responseType: "blob",
  });
