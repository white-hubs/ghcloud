import request from '@/utils/request'
let baseURL = '/api/alarm'

// 获取报警类型
export const getSatAlarmTypes = (params) =>
  request({
    url:baseURL+'/sat-alarm-types',
    method:'get',
    params
  })
// 获取报警级别
export const getAlarmLevels = (params) =>
  request({
    url:baseURL+'/sat-alarm-levels',
    method:'get',
    params
  })
// 报警记录列表
export const getAlarmRecords = (params) =>
  request({
    url:baseURL+'/alarm-records',
    method:'get',
    params
  })
// 报警记录详情
export const alarmRecordDetail = (params) =>
  request({
    url:baseURL+`/alarm-record/${params?.id || params}`,
    method:'get',
    params
  })
// 获取报警通知人员列表
export const getAlaramNoticPersonnerList = (params) =>
  request({
    url:baseURL+`/alarm-record/targets/${params.businessKey}`,
    method:'get',
    params
  })

//获取报警流程日志列表
export const getAlarmHandleProcess = (params) =>
  request({
    url:baseURL+`/alarm-record/operatorLogs/${params.id}`,
    method:'get',
    params
  })
// 报警状态事件操作列表
export const alarmEventOperates = (params) =>
  request({
    url:baseURL+`/alarm-record/state-event-operates/${params.id}`,
    method:'get',
    params
  })
// 报警移交
export const alarmHandleTransfer = (data) =>
  request({
    url:baseURL+`/alarm-record/transfer/${data.id}`,
    method:'put',
    data
  })
// 报警挂起
export const alarmHandleSuspend = (data) =>
  request({
    url:baseURL+`/alarm-record/suspend/${data.id}`,
    method:'put',
    data
  })
// 报警确认
export const alarmHandleConfirm = (data) =>
  request({
    url:baseURL+`/alarm-record/confirmed/${data.id}`,
    method:'put',
    data
  })
// 报警处理
export const alarmHandle = (data) =>
  request({
    url:baseURL+`/alarm-record/handler/${data.id}`,
    method:'put',
    data
  })