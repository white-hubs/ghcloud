import request from "@/utils/request";
import { authStore } from './auth-store'
import { CubeAlarmCenterService } from '@ghcloud/cube-alarm-center-service'

let baseURL = "/api/alarm";
// 新增报警原因
export const addAlarmReason = (data, type) =>
  request({
    url: baseURL + "/alarm-reason",
    method: "post",
    data,
  });

// 修改报警原因
export const updateAlarmReason = (data, type) =>
  request({
    url: baseURL + "/alarm-reason",
    method: "put",
    data,
  });
// 报警原因列表
export const getAlarmReasons = (params, type) =>
  request({
    url: baseURL + "/alarm-reason/page",
    method: "get",
    params,
  });

// 删除报警原因
export const deleteAlarmReason = (params, type) =>
  request({
    url: baseURL + `/alarm-reason/${params.id ? params.id : params}`,
    method: "delete",
  });

//报警类型列表
export const getSatAlarmTypes = (params, type) =>
  request({
    url: baseURL + "/sat-alarm-types",
    method: "get",
    params,
  });
//报警类型新增
export const postSatAlarmType = (data, type) =>
  request({
    url: baseURL + "/sat-alarm-type",
    method: "post",
    data,
  });

//报警类型修改
export const putSatAlarmType = (data, type) =>
  request({
    url: baseURL + `/sat-alarm-type/${data.id ? data.id : data}`,
    method: "put",
    data,
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
export const getSatAlarmLevels = (params, type) =>
  request({
    url: baseURL + "/sat-alarm-levels",
    method: "get",
    params,
  });

//报警级别新增
export const postSatAlarmLevel = (data, type) =>
  request({
    url: baseURL + "/sat-alarm-level",
    method: "post",
    data,
  });

//报警级别修改
export const putSatAlarmLevel = (data, type) =>
  request({
    url: baseURL + `/sat-alarm-level/${data.id ? data.id : data}`,
    method: "put",
    data,
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
    params,
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
export const putAlarmBatchHandler = (data, type) =>
  request({
    url: baseURL + `/alarm-records/batch-handler/${data.id ? data.id : data}`,
    method: "put",
    data,
  });

//一键消警
export const putAlarmOneClickHandler = (data, type) =>
  request({
    url: baseURL + `/alarm-records/one-click-handler/${data.id ? data.id : data}`,
    method: "put",
    data,
  });

// 报警音频配置
export const getAlarmLevelSoundConfig = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const cubeAlarmCenterService = new CubeAlarmCenterService(authStore)
      const levels = await cubeAlarmCenterService.getSatAlarmLevels()
      const configs = await cubeAlarmCenterService.getAlarmLevelPlayConfigList()
      const result = (levels ?? []).map(item => {
        const config = (configs ?? []).find(e => e.alarmLevelCode === item.code)
        return {
          ...item,
          ...config,
        }
      })
      resolve(result)
    } catch (error) {
      resolve([])
    }
  })
}
