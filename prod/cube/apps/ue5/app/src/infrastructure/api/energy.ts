import request from "../service/request";
import { EnenergyTrendType } from "@/infrastructure/api/models/energy";
const baseURL = "/api/energymanagement";

/**
 * 设备实时状态 instrumentType timeFlag
 */
export function getEnenergyTrendType<T extends Record<string, any>>(params?: T) {
  return request<EnenergyTrendType[]>({
    url: baseURL + `/energy-trend`,
    method: "GET",
    params,
  });
}
export function getEnenergyEreaType<T extends Record<string, any>>(params?: T) {
  return request<{
    list: {
      areaName: string;
      value: string;
    }[];
  }>({
    url: baseURL + `/energy-erea`,
    method: "GET",
    params,
  });
}
//sceneType? areaId type
export function getClassification<T extends Record<string, any>>(params?: T) {
  return request<
    {
      type: string;
      typeId: number;
      num: number;
      proportion: number;
    }[]
  >({
    url: `/api/securitymanagement/classification-offline`,
    method: "GET",
    params,
  });
}
//三维能耗趋势
export function energyTrend<T extends Record<string, any>>(params?: T) {
  return request<
    {
      timeFlag: string;
      value: string;
    }[]
  >({
    url: baseURL + `/three-dimensional-energy-trend`,
    method: "GET",
    params,
  });
}
//分项能耗
export function energyProject<T extends Record<string, any>>(params?: T) {
  return request<
    {
      projectName: string;
      value: number;
    }[]
  >({
    url: baseURL + `/energy-project`,
    method: "GET",
    params,
  });
}
//三维可视化概览
export function comprehensiveEnergy<T extends Record<string, any>>(params?: T) {
  return request<{
    energyCoal: number;
    energyCarbon: number;
    energyCoalRatio: number;
    energyCarbonRatio: number;
  }>({
    url: baseURL + `/three-dimensional-comprehensive-energy`,
    method: "GET",
    params,
  });
}
export function statCategoryAll<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: baseURL + `/energy-daily-usage/stat/category/all`,
    method: "GET",
    params,
  });
}
// 碳排趋势
export function statTimeCategory<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: baseURL + `/energy-daily-usage/dc/stat/time/category`,
    method: "GET",
    params,
  });
}
// 综合能耗趋势
export function dcStatTrend<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: baseURL + `/energy-daily-usage/dc/stat/trend`,
    method: "GET",
    params,
  });
}
// 能耗用能趋势
export function projectStatTrend<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: baseURL + `/energy-daily-usage/project/stat/trend`,
    method: "GET",
    params,
  });
}
// 能耗分项占比
export function projectStatCategory<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: baseURL + `/energy-daily-usage/project/stat/category`,
    method: "GET",
    params,
  });
}
// 能耗分类配置列表
export function collectConfigList<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: baseURL + `/energy-collect-config/list`,
    method: "GET",
    params,
  });
}
// 综合能耗概览
export function usageStatTypeList<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: baseURL + `/energy-daily-usage/stat/type/list`,
    method: "GET",
    params,
  });
}
// 单个能耗概览
export function usageStatTypeSingle<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: baseURL + `/energy-daily-usage/stat/type/single`,
    method: "GET",
    params,
  });
}
// 年用能趋势
export function statYearTrend<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: baseURL + `/yearEnergy/stat/yearTrend`,
    method: "GET",
    params,
  });
}
// 往年能耗概览
export function yearEnergyConversion<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: baseURL + `/yearEnergy/stat/conversion`,
    method: "GET",
    params,
  });
}
// 碳排量趋势
export function energyDailySummaryTrend<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: baseURL + `/energy-daily-summary/trend`,
    method: "GET",
    params,
  });
}
// 能耗分类每日统计分页列表(用能/碳排/综合能耗)
export function energyDailyUsageTypePage<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: baseURL + `/energy-daily-usage/typePage`,
    method: "GET",
    params,
  });
}
// 能耗分项每日统计分页列表(用能/碳排/综合能耗)
export function energyDailyUsageProjectPage<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: baseURL + `/energy-daily-usage/projectPage`,
    method: "GET",
    params,
  });
}
// 能耗汇总每日统计分页列表(用能/碳排/综合能耗)
export function energyDailySummarySummaryPage<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: baseURL + `/energy-daily-summary/summaryPage`,
    method: "GET",
    params,
  });
}
