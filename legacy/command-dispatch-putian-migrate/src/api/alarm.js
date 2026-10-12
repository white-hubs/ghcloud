import request from "@/utils/request";
let baseURL = "/api/alarm";
export const getAlarmPageNum = (params) =>
  request({
    url: baseURL + "/alarm-record/un-handler/page-number",
    method: "get",
    params,
  });
//报警类型列表
export const getSatAlarmTypes = (params, type) =>
  request({
    url: baseURL + "/sat-alarm-types",
    method: "get",
    params,
  });

//报警类型新增
export const postSatAlarmType = (params, type) =>
  request({
    url: baseURL + "/sat-alarm-type",
    method: "post",
    params,
  });
export const getAlarmDetail = (id) => {
  return request({
    url: baseURL + `/alarm-record/${id}`,
    method: "get",
  });
}
//报警类型修改
export const putSatAlarmType = (params, type) =>
  request({
    url: baseURL + `/sat-alarm-type/${params.id ? params.id : params}`,
    method: "put",
    params,
  });

//报警类型删除
export const deleteSatAlarmType = (params, type) =>
  request({
    url: baseURL + `/sat-alarm-type/${params.id ? params.id : params}`,
    method: "delete",
    params,
  });

//报警类型详情
export const getSatAlarmType = (params, type) =>
  request({
    url: baseURL + `/sat-alarm-type/${params.id ? params.id : params}`,
    method: "get",
    params,
  });

//报警级别列表
export const getAlarmLevels = (params, type) =>
  request({
    url: baseURL + "/sat-alarm-levels",
    method: "get",
    params,
  });

//报警级别新增
export const postSatAlarmLevel = (params, type) =>
  request({
    url: baseURL + "/sat-alarm-level",
    method: "post",
    params,
  });

//报警级别修改
export const putSatAlarmLevel = (params, type) =>
  request({
    url: baseURL + `/sat-alarm-level/${params.id ? params.id : params}`,
    method: "put",
    params,
  });

//报警级别删除
export const deleteSatAlarmLevel = (params, type) =>
  request({
    url: baseURL + `/sat-alarm-level/${params.id ? params.id : params}`,
    method: "delete",
    params,
  });

//报警记录列表
export const getAlarmRecords = (params, type) =>
  request({
    url: baseURL + "/alarm-records",
    method: "get",
    params,
  });

//报警记录详情
export const getAlarmRecordId = (params, type) =>
  request({
    url: baseURL + `/alarm-record/${params.id ? params.id : params}`,
    method: "get",
    params,
  });

//报警统计
export const getAlarmStatistics = (params, type) =>
  request({
    url: baseURL + `/alarm-statistics`,
    method: "get",
    params: {
      ...params,
      filterScope: 'DISPATCH'
    },
  });

//报警类型排名统计
export const getAlarmStatisticsTypeRank = (params, type) =>
  request({
    url: baseURL + `/alarm-statistics/type-rank`,
    method: "get",
    params,
  });

//报警趋势统计
export const getAlarmStatisticsTrend = (params, type) =>
  request({
    url: baseURL + `/alarm-statistics/trend`,
    method: "get",
    params,
  });

//获取当前用户未处理的报警消息列表
export const getAlarmMsgUnConfirmed = (params, type) =>
  request({
    url: baseURL + `/alarm-msg/un-confirmed/records`,
    method: "get",
    params,
  });

//获取当前用户未处理的报警消息数量
export const getAlarmMsgUnConfirmedCount = (params, type) =>
  request({
    url: baseURL + `/alarm-msg/un-confirmed/count`,
    method: "get",
    params,
  });

//报警批量处理
export const putAlarmBatchHandler = (params, type) =>
  request({
    url: baseURL + `/alarm-records/batch-handler`,
    method: "put",
    params,
  });

//一键消警
export const putAlarmOneClickHandler = (params, type) =>
  request({
    url: baseURL + `/alarm-records/one-click-handler`,
    method: "put",
    params,
  });

//获取报警流程日志列表
export const getOperatorLogs = (params, type) =>
  request({
    url:
      baseURL + `/alarm-record/operatorLogs/${params.id ? params.id : params}`,
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
//报警移交
export const postAlarmTransfer = (data, type) =>
  request({
    url: baseURL + `/alarm-record/transfer/${data.id}`,
    method: "put",
    data,
  });
// 报警指派
export const alarmHandelAssign = data =>
  request({
    url: baseURL + `/alarm-record/assign/${data.id}`,
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
/**报警处理 */
export const alarmHandelResult = data =>
  request({
    url: baseURL + `/alarm-record/handler/${data.id}`,
    method: "put",
    data,
  });
// 未处理的报警记录列表
export const unHandleAlarmRecordList = params =>
  request({
    url: baseURL + `/alarm-record/un-handler/list`,
    method: "get",
    params: {
      ...params,
      filterScope: 'DISPATCH'
    },
  });
export const getDeviceVideosInfo = params =>
  request({
    url:
      "/api/device/device/instance" +
      `/${params.deviceInstanceId}/associated/videos`,
    method: "get",
  });
export const subscribeDeviceAttribute = (data) =>
  request({
    url: baseURL + `/device/instance/running/attr/newSubscribe`,
    method: "post",
    data
  })
