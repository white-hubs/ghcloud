import request from "../../service/request";
const baseURL = '/api/alarm/'
const baseUrl1= '/api/device-center' 

/**
 * @说明 报警情况统计
 * @returns
 */
type Alarmratio={
    totalNum: number,
    ratio: number,
    handlerNum: number,
    handlerRatio: number,
    confirmedNum: number,
    confirmedRatio: number,
    actualNum: number,
    actualRatio: number,
    timeoutNum: number,
    timeoutRatio: number
}
/**
 * 获取事件排名
 * @param params 请求参数
 * @returns 返回Alarmratio类型的结果
 */
export function eventrank<T extends Record<string, any>>(params: T) {
  return request<any>({
    url: `${baseURL}/alarm-bim-statistics/event/top-five`,
    method: "get",
    params
  });
}
export function devicestatus<T extends Record<string, any>>(tagTypeCode: string,data:{
tagCodes:string[];
}) {
  return request<any>({
    url: `${baseUrl1}/device/${tagTypeCode}/status/count/by-tags`,
    method: "post",
    data
  });
}
export function statisticstrend<T extends Record<string, any>>(params: T) {
  return request<any>({
      url: `${baseURL}/alarm-bim-statistics/trend`,
      method: "get",
      params
  });
}