import { request } from "@/service/index";
enum URL {
  /**招聘申请统计 */
  getRecruitStatistics = "/personnel/statistics/recruit",
  /**招聘申请统计详情 */
  getRecruitStatisticsInfo = "/personnel/statistics/recruit/detail/",
  /** 招聘统计导出*/
  recruitStatisticsExport = "/personnel/statistics/recruit/export",
  /**入职申请统计 */
  getInductionStatistics = "/personnel/statistics/induction",
  /**入职申请统计详情 */
  getInductionStatisticsInfo = "/personnel/statistics/induction/detail/",
  /**入职申请导出 */
  inductionStatisticsExport = "/personnel/statistics/induction/export",
  /**试用考核统计 */
  getAppraiseStatistics = "/personnel/statistics/probation-assess",
  /**试用考核导出 */
  appraiseStatisticsExport = "/personnel/statistics/probation-assess/export",
  /**试用考核详情 */
  getAppraiseStatisticsInfo = "/personnel/statistics/probation-assess/detail/",
  /**转正申请统计 */
  getRegularStatistics = "/personnel/statistics/regular-worker",
  /**转正申请统计详情*/
  getRegularStatisticsInfo = "/personnel/statistics/regular-worker/detail/",
  /** 转正申请导出*/
  regularStatisticsExport = "/personnel/statistics/regular-worker/export",
  /** 离职统计*/
  getDepartStatistics = "/personnel/statistics/leave-office",
  /** 离职详情*/
  getDepartStatisticsInfo = "/personnel/statistics/leave-office/detail/",
  /** 离职导出 */
  departStatisticsExport = "/personnel/statistics/leave-office/export",
  /**轮岗统计 */
  getRotationPostStatistics = "/personnel/statistics/rotation-post",
  /**轮岗详情 */
  getRotationPostStatisticsInfo = "/personnel/statistics/rotation-post/detail/",
  /**轮岗导出 */
  rotationPostStatisticsExport = "/personnel/statistics/rotation-post/export",

}
/**
 * 招聘申请统计
 */
interface pageParams {
  pageNumber: number,
  pageSize: number,
  period: string
}
export const getRecruitStatistics = (params: pageParams) => {
  return request.get(URL.getRecruitStatistics, { params });
};
/**
 * 招聘申请详情
 */
export const getRecruitStatisticsInfo = (id: string, params: infoParams) => {
  return request.get(URL.getRecruitStatisticsInfo + id, { params });
};
/**
 * 招聘申请导出
 */
interface exportParams {
  period: string
}
export const recruitStatisticsExport = (data: exportParams) => {
  return request.post(URL.recruitStatisticsExport, data, {
    responseType: "blob"
  });
};
/**
 * 入职申请统计
 */
export const getInductionStatistics = (params: pageParams) => {
  return request.get(URL.getInductionStatistics, { params });
};
/**
 * 入职申请统计详情
 */
interface infoParams {
  period: string,
  pageNumber: number,
  pageSize: number
}
export const getInductionStatisticsInfo = (id: string, params: infoParams) => {
  return request.get(URL.getInductionStatisticsInfo + id, { params });
};
/**
 * 入职申请统计导出
 */
export const inductionStatisticsExport = (data: exportParams) => {
  return request.post(URL.inductionStatisticsExport, data, {
    responseType: "blob"
  });
};
/**
 * 试用考核统计
 */
export const getAppraiseStatistics = (params: pageParams) => {
  return request.get(URL.getAppraiseStatistics, { params });
};
/**
 * 考核统计详情
 */
export const getAppraiseStatisticsInfo = (id: string, params: infoParams) => {
  return request.get(URL.getAppraiseStatisticsInfo + id, { params });
};
/**
 * 考核申请导出
 */
export const appraiseStatisticsExport = (data: exportParams) => {
  return request.post(URL.appraiseStatisticsExport, data, {
    responseType: "blob"
  });
};
/**
 * 转正申请统计
 */
export const getRegularStatistics = (params: pageParams) => {
  return request.get(URL.getRegularStatistics, { params });
};
/**
 * 转正申请统计详情
 */
export const getRegularStatisticsInfo = (id: string, params: infoParams) => {
  return request.get(URL.getRegularStatisticsInfo + id, { params });
};
/**
 * 转正申请导出 
 */
export const regularStatisticsExport = (data: exportParams) => {
  return request.post(URL.regularStatisticsExport, data, {
    responseType: "blob"
  });
};
/**
 * 离职申请统计 
 */
export const getDepartStatistics = (params: pageParams) => {
  return request.get(URL.getDepartStatistics, { params });
};
/**
 * 离职申请统计详情
 */
export const getDepartStatisticsInfo = (id: string, params: infoParams) => {
  return request.get(URL.getDepartStatisticsInfo + id, { params });
};
/**
 * 离职申请导出
 */
export const departStatisticsExport = (data: exportParams) => {
  return request.post(URL.departStatisticsExport, data, {
    responseType: "blob"
  });
}
/**
 * 轮岗申请统计 
 */
export const getRotationPostStatistics = (params: pageParams) => {
  return request.get(URL.getRotationPostStatistics, { params });
};
/**
 * 轮岗申请统计详情
 */
export const getRotationPostStatisticsInfo = (id: string, params: infoParams) => {
  return request.get(URL.getRotationPostStatisticsInfo + id, { params });
};
/**
 * 轮岗申请统计导出 
 */
export const rotationPostStatisticsExport = (data: exportParams) => {
  return request.post(URL.rotationPostStatisticsExport, data, {
    responseType: "blob"
  });
}
