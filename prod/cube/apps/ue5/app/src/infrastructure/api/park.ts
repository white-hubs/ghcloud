import request from "../service/request";
import { ParkFloors, RentalTrends, StatisticsEnterprises, UtilizationRate } from "./models/park";
const baseURL = "/api/park";

/**
 * 空间利用率
 */
export function utilizationRate<T extends Record<string, any>>(params?: T) {
  return request<UtilizationRate>({
    url: baseURL + `/space-utilization-rate`,
    method: "GET",
  });
}
/**
 * 楼栋空间利用率
 */
export function buildingUtilizationRate<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: baseURL + `/building-space-utilization-rate`,
    method: "GET",
  });
}
/**
 * 租赁企业行业统计
 */
export function statisticsEnterprises<T extends Record<string, any>>(params?: T) {
  return request<StatisticsEnterprises>({
    url: baseURL + `/industry-statistics-enterprises`,
    method: "GET",
  });
}
/**
 * 园区租赁总情况
 */
export function parkLeasing<T extends Record<string, any>>(params?: T) {
  return request<any>({
    url: baseURL + `/overall-situation-park-leasing`,
    method: "GET",
  });
}
/**
 * 园区租赁趋势
 */
export function rentalTrends<T extends Record<string, any>>(params?: T) {
  return request<RentalTrends>({
    url: baseURL + `/rental-trends`,
    method: "GET",
  });
}
/**
 * 园区楼层租赁比情况
 */
export function parkFloors(areaId?: string) {
  return request<ParkFloors[]>({
    url: baseURL + `/rental-ratio-park-floors/${areaId}`,
    method: "GET",
  });
}
