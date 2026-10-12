import request from "../service/request";
import { PlayRecordTop } from './models/conference'
const baseURL = '/api/conference'

export interface ConferenceUsedRatio {
	usedRatio: number;
	dayOnDay: number;
	weekOnWeek: number;
}
/**
 * @说明 未来8小时会议空闲情况
 * @returns
 */
export function availabilityHours() {
  return request<any>({
      url: `${baseURL}/meeting-availability-next-hours`,
      method: "GET",
  });
}
/**
 * @说明 预定时段分析
 * @returns
 */
export function scheduledPeriods() {
  return request<any>({
      url: `${baseURL}/analysis-scheduled-time-periods`,
      method: "GET",
  });
}
/**
 * @说明 会议室利用率分析
 * @returns
 */
export function playRecordTop<T extends Record<string, any>>(params: T) {
  return request<PlayRecordTop[]>({
      url: `${baseURL}/analysis-conference-room-utilization-rate`,
      method: "GET",
      params
  });
}
/**
 * @说明 会议室利用率分析
 * @returns
 */
export function conferenceUsedRatio<T extends Record<string, any>>(params: T) {
  return request<ConferenceUsedRatio>({
      url: `${baseURL}/conference/used/ratio`,
      method: "GET",
      params
  });
}