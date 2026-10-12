import request from "../service/request";
const baseURL = "/api/attendance/";
import { DutyPersonnel } from "./models/attendance";
/**
 * @说明 查询当日当班人员
 * @returns
 */
export async function arrangeTodayStat<T extends Record<string, any>>() {
  return await request<DutyPersonnel>({
    url: `${baseURL}att/scheduling/workingStaff`,
    method: "GET",
  });
}
export async function arrangePage<T extends Record<string, any>>(params: T) {
  return await request<any>({
    url: `${baseURL}att/scheduling/workStaffPage`,
    method: "GET",
    params,
  });
}
export async function getRiskSource<T extends Record<string, any>>(params: {
  dimension: string;
  eventResult: string;
  period: string;
  typeNames: string[];
}) {
  return await request<{
    totalNum: number;
    typeVOList: any[];
  }>({
    url: `/api/property/property/visualization/riskSource/analyse`,
    method: "GET",
    params,
  });
}
export async function getPropertyDetailedPage<T extends Record<string, any>>(params: {
  pageNumber: number;
  pageSize: number;
  typeId: string;
}) {
  return await request<{
    total: number;
    records: any[];
  }>({
    url: `/api/property/property/detailed/getPropertyDetailedPage`,
    method: "GET",
    params,
  });
}
