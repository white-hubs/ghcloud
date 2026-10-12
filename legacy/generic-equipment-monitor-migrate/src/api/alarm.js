import axios from "axios";

import request from "@/utils/request";
let baseURL = "/api/alarm";
let baseURLSafety = "/api/safety-management";
let baseURLEnergy = "/api/energymanagement";
import { cubeAlarmCenterService } from "@/api/service";
// export const getRoleList = (params, method = "get") =>
//   request({
//     url: `/api/ouaa/authenticated/product/role/page`,
//     method: method,
//     params,
//   });
export const gettokenouaa = (params) =>
  request({
    url: `/api/ouaa/oauth2/token`,
    method: "POST",
    params,
    headers: {
      // 'Accept':'application/json, text/plain, */*',
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
export const getmarketconfig = (id, method = "get") =>
  request({
    url: `/api/dataintegrate/market-config/${id}`,
    method: method,
  });
export const getAlarmSafetyRecords = (params, method = "get") =>
  request({
    url: baseURLSafety + "/alarm-record/page",
    method: method,
    params,
  });
export const getAlarmTypes = (params, method = "get") =>
  request({
    url: baseURLSafety + "/alarm-types",
    method: method,
    params,
  });
export const marketlist = (params, method = "get") =>
  request({
    url: "/api/dataintegrate/market-config/list",
    method: method,
    params,
  });
export const alarmConfigAdd = (data, method) =>
  request({
    url: baseURLEnergy + `/alarm-rules`,
    method: method,
    data,
  });

// 仪表类型
export const meterType = (params, method) =>
  request({
    url: baseURLEnergy + `/enumType/getInstumenttype`,
    method: method,
    params,
  });

// 区域管理接口 - 区域列表(区域管理)
export const getAreaList = (params, method) =>
  request({
    url: baseURLEnergy + "/area-list",
    method: "get",
    params,
  });
export const alarm = (params, method) =>
  request({
    url: baseURLEnergy + `/alarm-rules/page`,
    method: method,
    params,
  });

// 修改报警规则配置状态
export const updateStatus = (params, method) =>
  request({
    url: baseURLEnergy + `/alarm-rules/updateStatus/${params.id}/${params.status}`,
    method: "put",
  });

export const alarmConfigId = (data, method) =>
  request({
    url: baseURLEnergy + `/alarm-rules/${data?.id ? data?.id : data}`,
    method: method,
    data,
  });

export const meter = (params, method) =>
  request({
    url: baseURLEnergy + `/meter-device/page`,
    method: method,
    params,
  });

export const tenantUsersPost = (params, method = "get") => {
  if (window.config.feature?.usePersonal) {
    return request({
      url: "/api/personnel" + "/staff/state/page",
      method: method,
      params: { ...params, enabled: true },
    });
  } else {
    return request({
      url: "/api/ouaa" + "/authenticated/user-under-tenant/page",
      method: method,
      params: {
        ...params,
        enabled: true,
      },
    });
  }
};
// 报警记录列表
export const getAlarmRecords = (params, method = "get") =>
  request({
    url: baseURL + "/alarm-records",
    method: method,
    params,
  });
// 下钻报警记录
export const getAlarmRecordsCommonPage = (params, method = "get") =>
  request({
    url: baseURL + "/alarm-records/common-page",
    method: method,
    params,
  });
export const deleteAlarmRecord = (ids) => cubeAlarmCenterService.deleteAlarmRecord(ids);
// 获取报警级别
export const getAlarmLevels = (params) =>
  request({
    url: baseURL + "/sat-alarm-levels",
    method: "get",
    params,
  });
// 报警记录详情
export const alarmRecordDetail = (params) =>
  request({
    url: baseURL + `/alarm-record/${params?.id || params}`,
    method: "get",
  });
//获取报警流程日志列表
export const getAlarmHandleProcess = (params) =>
  request({
    url: baseURL + `/alarm-record/operatorLogs/${params.id}`,
    method: "get",
    params,
  });
// 报警状态事件操作列表
export const alarmEventOperates = (params) =>
  request({
    url: baseURL + `/alarm-record/state-event-operates/${params.id}`,
    method: "get",
    params,
  });
// 报警移交
export const alarmHandelTransfer = (data) =>
  request({
    url: baseURL + `/alarm-record/transfer/${data.id}`,
    method: "put",
    data,
  });
// 报警挂起
export const alarmHandelSuspend = (data) =>
  request({
    url: baseURL + `/alarm-record/suspend/${data.id}`,
    method: "put",
    data,
  });
export const alarmHandelAssign = (data) =>
  request({
    url: baseURL + `/alarm-record/assign/${data.id}`,
    method: "put",
    data,
  });
export const alarmHandelResult = (data) =>
  request({
    url: baseURL + `/alarm-record/handler/${data.id}`,
    method: "put",
    data,
  });
// 报警批量处理
export const alarmBatchHandler = (data) =>
  request({
    url: baseURL + "/alarm-records/batch-handler",
    method: "put",
    data,
  });
// 报警事件状态分组统计分页列表
export const getAlarmStatisticByEvent = (params) =>
  request({
    url: baseURL + `/alarm-statistics/event-status-page`,
    method: "get",
    params,
  });
// 按用户分组统计报警状态分页列表
export const getAlarmStatisticByUser = (params) =>
  request({
    url: baseURL + `/alarm-statistics/user-status-page`,
    method: "get",
    params,
  });
// 按报警级别统计
export const alarmLevelStatistic = (params) =>
  request({
    url: baseURL + `/alarm-statistics/level`,
    method: "get",
    params,
  });
// 按区域报警统计
export const alarmAreaStatistic = (params) =>
  request({
    url: baseURL + `/alarm-statistics/area-group`,
    method: "get",
    params,
  });
// 巡检线路异常分组统计
export const patrolAbnormalGroup = (params) =>
  request({
    url: "/api/vmonitor" + `/camera-patrol-line-statistics/group-abnormal`,
    method: "get",
    params,
  });
// 按区域报警统计前十
export const alarmareatopten = (params) =>
  request({
    url: baseURL + `/alarm-statistics/area-top-ten`,
    method: "get",
    params,
  });
// 按设备报警统计前十
export const alarmdevicetopten = (params) =>
  request({
    url: baseURL + `/alarm-statistics/device-top-ten`,
    method: "get",
    params,
  });

// 报警事件分组统计
export const alarmEventStatistic = (params) =>
  request({
    url: baseURL + `/alarm-statistics/event-group`,
    method: "get",
    params,
  });
// 报警趋势分析
export const alarmTrendAnalysis = (params) =>
  request({
    url: baseURL + `/alarm-statistics/trend-analysis`,
    method: "get",
    params,
  });
// 报警事件报警分析
export const alarmEventAnalysis = (params) =>
  request({
    url: baseURL + `/alarm-statistics/event-analysis`,
    method: "get",
    params,
  });
// 报警区域报警分析
export const alarmAreaAnalysis = (params) =>
  request({
    url: baseURL + `/alarm-statistics/area-analysis`,
    method: "get",
    params,
  });
// 报警处理分析
export const alarmHandelAreaAnalysis = (params) =>
  request({
    url: baseURL + `/alarm-statistics/user-handler-analysis`,
    method: "get",
    params,
  });
// 报警级别处理效率统计
export const alarmHandelEfficiencyAnalysis = (params) =>
  request({
    url: baseURL + `/alarm-statistics/level-handler-efficiency-analysis`,
    method: "get",
    params,
  });
// 用户报警处理效率排名前10
export const userHandlerTopAnalysis = (params) =>
  request({
    url: baseURL + `/alarm-statistics/user-handler-efficiency-top-ten-analysis`,
    method: "get",
    params,
  });
// 用户报警处理效率排名倒数前10
export const userHandlerLastTopAnalysis = (params) =>
  request({
    url: baseURL + `/alarm-statistics/user-handler-efficiency-last-top-ten-analysis`,
    method: "get",
    params,
  });
// 报警总数环比率统计
export const alarmTotalStatistic = (params) =>
  request({
    url: baseURL + `/alarm-statistics/ring-ratio-analysis`,
    method: "get",
    params,
  });
// 报警状态分组统计
export const alarmStatusGroupStatistics = (params) =>
  request({
    url: baseURL + `/alarm-statistics/status-group`,
    method: "get",
    params,
  });
// 报警事件状态分组列表导出
export const alarmStatisticExport = (data) =>
  request({
    url: baseURL + `/alarm-statistics/event-status/list/export`,
    method: "post",
    data,
    responseType: "blob",
  });
// 按用户分组统计报警状态列表导出
export const alarmHandelStatisticExport = (data) =>
  request({
    url: baseURL + `/alarm-statistics/user-status/list/export`,
    method: "post",
    data,
    responseType: "blob",
  });
// 报警记录导出
export const alarmRecordExport = (data) =>
  request({
    url: baseURL + `/alarm-records/export`,
    method: "post",
    data,
    responseType: "blob",
  });
// 按报警对象类型统计
export const alarmTargetStatistic = (data) =>
  request({
    url: baseURL + `/alarm-statistics/target-type`,
    method: "get",
    params,
  });
