import request from "@/utils/request";

const baseURL = "/api/alarm";

//获取当前用户未处理的报警消息列表
// getAlarmMsgUnConfirmed
export const getAlarmMsgUnConfirmed = (params, type) =>
  request({
    url: baseURL + `/alarm-msg/un-confirmed/records`,
    method: "get",
    params,
  });
export const getImage = (id) =>
  request({
    url: `/api/file/file/${id}`,
    method: "get",

  });
  export const getAlarmDetail = (id,header) => {
    return request({
      url: baseURL + `/alarm-record/${id}`,
      method: "get",
      header
    });
  }

//获取当前用户未处理的报警消息数量
// getAlarmMsgUnConfirmedCount
export const getAlarmMsgUnConfirmedCount = (params, type) =>
  request({
    url: baseURL + `/alarm-msg/un-confirmed/count`,
    method: "get",
    params,
  });

//一键消警
// putAlarmOneClickHandler
export const putAlarmOneClickHandler = (params, type) =>
  request({
    url: baseURL + `/alarm-records/one-click-handler`,
    method: "put",
    params,
  });

/**
 * @说明 市场配置
 * @returns
 */
export const getMarketConfig = (params) => {
  return request({
    url: `/api/dataintegrate/market-config/${params.id ? params.id : params}`,
    method: "get",
    params
  });
}