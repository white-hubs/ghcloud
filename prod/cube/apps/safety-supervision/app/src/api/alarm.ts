import { Get, Post, type BaseAPIResult, Put, Delete, service } from '@ghcloud/ghcloud-business-request'
export interface PageResult {
  total: number;
  page: number;
  records: unknown[];
}

const baseUrl = 'safety-management'
const baseUrl2 = '/alarm'
export const getalarmlist = async (params: {
  pageNumber: number;
  pageSize: number;
  keyword?: string;

}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/alarm-type/page', { params })
}
export const getAlarmLevels = async (params?: Record<string, string | boolean | number>): Promise<Service.RequestResult> => {
  return Get(baseUrl + '/sat-alarm-levels', params)

}
export const getlevels = async (alarmTypeCode: string): Promise<BaseAPIResult<{ alarmLevelCode: string; timeout: boolean; }[]>> => {
  return Get(baseUrl + `/alarm-config/${alarmTypeCode}/levels`, { })
}
export const putlevels = async (alarmTypeCode: string, levelCode: string, timeout?: boolean): Promise<BaseAPIResult> => {
  const params = new URLSearchParams();
  if (timeout !== undefined) {
    params.append('timeout', timeout.toString());
  }
  const basePath = `${baseUrl}/alarm-config/${alarmTypeCode}/level/${levelCode}`;
  const queryString = params.toString();
  const url = queryString ? `${basePath}?${queryString}` : basePath;
  return Put(url, {});
}
export const deletelevels = async (alarmTypeCode: string, levelCode: string): Promise<BaseAPIResult> => {
  return Delete(baseUrl + `/alarm-config/${alarmTypeCode}/level/${levelCode}`, { })
}
export const alarmNotice = async (params: { businessType: string; }): Promise<BaseAPIResult> => {
  return Get(baseUrl + '/alarm-notice', { params })
}
export const sceneReceive = async (code: string): Promise<BaseAPIResult> => {
  return Get(`/message2/sat-msg-scene-receive/code/${code}`)
}
export const setAlarmNotice = async (params: any): Promise<BaseAPIResult> => {
  return Post(baseUrl + '/alarm-notice', params)
}
export const satMsgTmpList = async (params: { channelCode: string;applicationCode: string; }): Promise<BaseAPIResult> => {
  return Get('message2/sat-msg-tmp/list', { params })
}

/** 报警记录 */
export const getAlarmRecord = async (params: Record<string, string | boolean | number | null>): Promise<Service.RequestResult> => {
  return Get(baseUrl + '/alarm-record/page', { params })
}
/** 月报链接 */
export const getmonthReportUrl = async (params: Record<string, string | boolean | number | null>): Promise<Service.RequestResult> => {
  return Get(baseUrl + '/market_month_report_url/page', { params })
}
/** 报警分类 */
export const getAlarmTypes = async (params?: Record<string, string | boolean | number>): Promise<Service.RequestResult> => {
  return Get(baseUrl + '/alarm-types', { params })
}
/** 获取市场 */
export const getMarketList = async (params?: Record<string, string | boolean | number>): Promise<Service.RequestResult> => {
  return Get('/dataintegrate/market-config/list', { params })
}
/** 报警安全报表 */
export const getAlarmReport = async (params: Record<string, string | boolean | number | null>): Promise<Service.RequestResult> => {
  return Get(baseUrl + '/alarm-record/report', { params })
}
/** 安全月报导出 */
export const exportAlarmReport = async (params: Record<string, string | boolean | number | null>): Promise<Service.RequestResult> => {
  return service.post(baseUrl + '/alarm-record/report/export', params)
}
/** 报警记录导出 */
export const exportAlarmRecord = async (params: Record<string, string | boolean | number | null>): Promise<Service.RequestResult> => {
  return service.post(baseUrl + '/alarm-record/export', params)
}

/** 报警记录-详情 */
// url拼接二级市场的地址, header 要带上二级市场的token tenant
export const getAlarmDetail = async (params: {
  url?: string;
  tenant?: string;
  token?: string;
  id: string;
}): Promise<Service.RequestResult> => {
  const path = params.url + 'api/alarm'
  return Get(path + `/alarm-record/${params.id}`, {
    headers: {
      tenant: params.tenant,
      Authorization: `Bearer ${params.token}`
    }
  })
}
export const getAlarmHandleProcessLog = async (params: {
  url?: string;
  tenant?: string;
  token?: string;
  id: string;
}): Promise<Service.RequestResult> => {
  const path = params.url ? params.url + '/api/alarm' : baseUrl2
  return Get(path + `/alarm-record/operatorLogs/${params.id}`, {
    headers: {
      tenant: params.tenant,
      Authorization: `Bearer ${params.token}`
    }
  })
}
export const getVideoEventAction = async (params: {
  url?: string;
  tenant?: string;
  token?: string;
  id: string;
}): Promise<Service.RequestResult> => {
  const path = params.url + '/api/linkage'
  return Get(path + `/event-video-file-paths/${params.id}`, {
    headers: {
      tenant: params.tenant,
      Authorization: `Bearer ${params.token}`
    }
  })
}
export const loginSession = async (params: {
  url?: string;
  tenant?: string;
  token?: string;
}): Promise<Service.RequestResult> => {
  const path = params.url ? params.url + '/api/mdata' : '/api/mdata'
  return Get(path + '/video-ptz/login-session', {
    headers: {
      tenant: params.tenant,
      Authorization: `Bearer ${params.token}`
    }
  })
}
export const executeControlIotDevice = async (params: {
  url?: string;
  tenant?: string;
  token?: string;
  eventIotDeviceId: string;
}): Promise<Service.RequestResult> => {
  const path = params.url ? params.url + '/api/safety-management' : baseUrl
  return Post(path + '/securitymanagement/event-iot-device-pro/ctrl', params, {
    headers: {
      tenant: params.tenant,
      Authorization: `Bearer ${params.token}`
    }
  })
}
export const getIotDeviceListByEvent = async (params: {
  url?: string;
  tenant?: string;
  token?: string;
  eventId: string;
}): Promise<Service.RequestResult> => {
  const path = params.url + '/api'
  return Get(path + `/linkage/event-iot-device-pros/${params.eventId}`, {
    headers: {
      tenant: params.tenant,
      Authorization: `Bearer ${params.token}`
    }
  })
}
export const getIotDeviceProRecords = async (params: {
  url?: string;
  tenant?: string;
  token?: string;
  eventId: string;
}): Promise<Service.RequestResult> => {
  const path = params.url + '/api'
  return Get(path + `/linkage/event-iot-device-pro-records/${params.eventId}`, {
    headers: {
      tenant: params.tenant,
      Authorization: `Bearer ${params.token}`
    }
  })
}
export const getDeviceInfo = async (params: {
  url?: string;
  tenant?: string;
  token?: string;
  id: string;
}): Promise<Service.RequestResult> => {
  const path = params.url + '/api/linkage'
  return Get(path + `/securityManagement/getDeviceInfo/${params.id}`, {
    headers: {
      tenant: params.tenant,
      Authorization: `Bearer ${params.token}`
    }
  })
}
// 获取二级市场的url 和 账密 ，换取token
export const getSubMarketInfo = async (params: {
  id: string;
}): Promise<Service.RequestResult> => {

  return Get(`/dataintegrate/market-config/${params.id ? params.id : params}`)
}
