import request from '@/utils/request'
let baseURL = '/api/linkage'

// 新增规则
export const addLinkageRule = (data) =>
  request({
    url: baseURL + '/rule',
    method: 'post',
    data
  })
//再次推送联动报警
export const repeatPushAlarm = (id) =>
  request({
    url: baseURL + `/rule/re-trigger-event/${id}`,
    method: "get",
    method: "get",
  });
// 设备报警规则分页列表
export const deviceRuleAlarmPage = (params) =>
  request({
    url: baseURL + '/rule-device-alarms',
    method: 'get',
    params
  })
// 规则状态修改
export const changeRuleEnabled = (params) =>
  request({
    url: baseURL + `/rule/enabled/${params.id}/${params.enabled}`,
    method: 'put',
    params
  })
// 规则删除
export const deleteRule = (params) =>
  request({
    url: baseURL + `/rule/${params?.id || params}`,
    method: 'delete',
    params
  })
// 规则批量删除
export const batchDeleteRule = (params) =>
  request({
    url: baseURL + `/rule/batch`,
    method: 'delete',
    params
  })
// 规则详情
export const getRuleDetail = (params) =>
  request({
    url: baseURL + `/rule/${params?.id || params}`,
    method: 'get',
    params
  })
// 规则修改
export const modifyUrle = (data) =>
  request({
    url: baseURL + `/rule/${data.basicModify.id}`,
    method: 'put',
    data
  })
/**物联设备动作 */

//根据事件获取物联设备执行记录
export const getIotDeviceProRecords = (params) =>
  request({
    url: baseURL + `/event-iot-device-pro-records/${params.eventId}`,
    method: 'get',
    params
  })
// 根据事件获取物联设备列表
export const getIotDeviceListByEvent = (params) =>
  request({
    url: baseURL + `/event-iot-device-pros/${params.eventId}`,
    method: 'get',
    params
  })
// 手动控制
export const manualControlIotDevice = (data) =>
  request({
    url: baseURL + `/event-iot-device-pro/ctrl`,
    method: 'post',
    data
  })
/**摄像机动作 */

// 根据事件获取摄像机动作列表
export const getVideoActionByEvent = (params) =>
  request({
    url: baseURL + `/event-video/${params.eventId}`,
    method: 'get',
    params
  })
// 根据事件获取摄像机动作执行记录列表
export const getVideoProRecords = (params) =>
  request({
    url: baseURL + `/event-video-records/${params.eventId}`,
    method: 'get',
    params
  })
// 手动执行
export const manualControlVideo = (params) =>
  request({
    url: baseURL + `/event-video/ctl`,
    method: 'get',
    params
  })


// 条件规则列表分页
export const conditionRulePage = (params) =>
  request({
    url: baseURL + `/rule-device-conditions`,
    method: 'get',
    params
  })
// 事件分页列表
export const getTriggerLinkageRecords = (params) =>
  request({
    url: baseURL + `/events`,
    method: 'get',
    params
  })
// 场景规则分页列表
export const getSceneRulePage = (params) =>
  request({
    url: baseURL + `/rule-scenes`,
    method: 'get',
    params
  })
// 触发场景任务
export const triggerSceneLinkage = (data) =>
  request({
    url: baseURL + `/rule-scene/trigger`,
    method: 'post',
    data
  })
// 事件详情
export const getLinkageEventDetail = (params) =>
  request({
    url: baseURL + `/event/${params.id}`,
    method: 'get',
    params
  })
// 获取定时规则分页列表
export const getTimeingTaskPage = (params) =>
  request({
    url: baseURL + `/rule-timings`,
    method: 'get',
    params
  })
// 根据事件获取摄像机动作执行附件列表
export const getVideoEventAction = (params) =>
  request({
    url: baseURL + `/event-video-file-paths/${params.eventId}`,
    method: 'get',
  })