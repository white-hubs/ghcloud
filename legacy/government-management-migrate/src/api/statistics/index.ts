import { request } from "@/service/index";
enum URL {
  /**规章制度统计 */
  getRegulationStatistic = "/official/regulation/stat",
  /**规章制度详情 */
  getRegulationStatisticInfo = "/official/regulation/stat/",
  /**规章制度导出 */
  regulationStatisticExport = "/official/export/regulation/stat",
  /**印章统计 */
  getSealStatistics = "/official/officialSeal/stat",
  /**印章统计详情 */
  getSealStatisticsInfo = "/official/officialSeal/stat/",
  /**印章统计导出 */
  sealStatisticsExport = "/official/export/officialSeal/stat",
  /**预提预报统计 */
  getTopicStatistic = "/official/topic/stat",
  /**预提预报统计详情 */
  getTopicStatisticInfo = "/official/topic/stat/",
  /**预提预报统计导出 */
  topicStatisticExport = "/official/export/topic/stat",
  /**来文统计 */
  getDocumentReceivedStatistic = "/official/documentReceived/stat",
  /**来文统计导出 */
  documentReceivedExport = "/official/export/documentReceived/stat",
  /**部门工作统计 */
  getkeyWorkStatistic = "/official/keyWork/stat",
  /**部门工作统计导出 */
  keyWorkStatisticExport = "/official/export/keyWork/stat",
  /**督办事项审批统计 */
  getFocusWorkApprovalStatistics = "/official/focusWork/stat",
  /**督办事项审批统计导出 */
  focusWorkApprovalStatisticsExport = "/official/export/focusWork/stat",
  /**督办事项变更统计 */
  getFocusWorkExchangeStatistics = "/official/focusWork/update/stat",
  /**督办事项变更统计导出 */
  focusWorkExchangeStatisticsExport = "/official/export/focusWork/update/stat"
}
interface pageParams {
  pageNumber: number,
  pageSize: number,
  period: string
}
/**
 * 规章制度统计
 */
export const getRegulationStatistic = (params: pageParams) => {
  return request.get(URL.getRegulationStatistic, { params });
};
interface detailParams {
  period: string,
  pageNumber: number,
  pageSize: number
}
/**
 * 规章制度统计详情
 */
export const getRegulationStatisticInfo = (id: string, params: detailParams) => {
  return request.get(URL.getRegulationStatisticInfo + id + '/detail', { params });
};
/**
 * 规章制度统计导出 
 */
interface exportParams {
  period: string
}
export const regulationStatisticExport = (data: exportParams) => {
  return request.post(URL.regulationStatisticExport, data, {
    responseType: "blob"
  });
};
/**
 * 印章统计详情
 */
export const getSealStatisticsInfo = (id: string, params: detailParams) => {
  return request.get(URL.getSealStatisticsInfo + id + '/detail', { params });
};
/**
 * 印章统计
 */
export const getSealStatistics = (params: pageParams) => {
  return request.get(URL.getSealStatistics, { params });
};
/**
 * 印章统计导出
 */
export const sealStatisticsExport = (data: exportParams) => {
  return request.post(URL.sealStatisticsExport, data, {
    responseType: "blob"
  });
};
/**
 * 预提预报统计
 */
export const getTopicStatistic = (params: pageParams) => {
  return request.get(URL.getTopicStatistic, { params });
};
/**
 * 预提预报详情
 */
export const getTopicStatisticInfo = (id: string, params: detailParams) => {
  return request.get(URL.getTopicStatisticInfo + id + '/detail', { params });
};
/**
 * 预提预报导出
 */
export const topicStatisticExport = (data: exportParams) => {
  return request.post(URL.topicStatisticExport, data, {
    responseType: "blob"
  });
};
/**
 * 来文统计
 */
export const getDocumentReceivedStatistic = (params: pageParams) => {
  return request.get(URL.getDocumentReceivedStatistic, { params });
};
/**
 * 预提预报导出
 */
export const documentReceivedExport = (data: exportParams) => {
  return request.post(URL.documentReceivedExport, data, {
    responseType: "blob"
  });
};
/**
 * 部门工作统计 
 */
export const getkeyWorkStatistic = (params: pageParams) => {
  return request.get(URL.getkeyWorkStatistic, { params });
};
/**
 * 部门工作统计导出
 */
export const keyWorkStatisticExport = (data: exportParams) => {
  return request.post(URL.keyWorkStatisticExport, data, {
    responseType: "blob"
  });
};
/**
 * 督办事项审批统计
 */
export const getFocusWorkApprovalStatistics = (params: pageParams) => {
  return request.get(URL.getFocusWorkApprovalStatistics, { params });
};
/**
 * 督办事项审批统计导出
 */
export const focusWorkApprovalStatisticsExport = (data: exportParams) => {
  return request.post(URL.focusWorkApprovalStatisticsExport, data, {
    responseType: "blob"
  });
};
/**
 * 督办事项变更统计
 */
export const getFocusWorkExchangeStatistics = (params: pageParams) => {
  return request.get(URL.getFocusWorkExchangeStatistics, { params });
}
/**督办事项变更统计导出 */
export const focusWorkExchangeStatisticsExport = (data: exportParams) => {
  return request.post(URL.focusWorkExchangeStatisticsExport, data, {
    responseType: "blob"
  });
};