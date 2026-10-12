import request from "@/utils/request";
let baseURL = "/api/alarm";
// 报警记录列表
export const getAlarmRecords = (params, method = "get") =>
  request({
    url: baseURL + "/alarm-records",
    method: method,
    params,
  });
export const tenantinfo = (code, method = "get") =>
  request({
    url:  `/ouaa/tenant-under-tenant/${code}`,
    method: method,
 
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
// 报警挂起
export const alarmHandelSuspend = data =>
  request({
    url: baseURL + `/alarm-record/suspend/${data.id}`,
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
    url: baseURL + `/getElectricityTimeRecord`,
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
// 巡检线路异常分组统计
export const patrolAbnormalGroup = params =>
  request({
    url: "/api/vmonitor" + `/camera-patrol-line-statistics/group-abnormal`,
    method: "get",
    params,
  });
// 按区域报警统计前十
export const alarmareatopten = params =>
  request({
    url: baseURL + `/alarm-statistics/area-top-ten`,
    method: "get",
    params,
  });
// 按设备报警统计前十
export const alarmdevicetopten = params =>
  request({
    url: baseURL + `/alarm-statistics/device-top-ten`,
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
