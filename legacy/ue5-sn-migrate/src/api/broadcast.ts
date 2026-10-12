import request from "../service/request";
import { PlayRecordTop, RecordTotal, RecordTrend, StatisticsRecord } from './models/broadcast'
const baseURL = '/api/broadcast/'

/**
 * @说明 播放记录top5
 * @returns
 */
export function playRecordTop<T extends Record<string, any>>(params: T) {
  return request<PlayRecordTop[]>({
      url: `${baseURL}statistics-play-record-top`,
      method: "GET",
      params
  });
}

/**
 * @说明 播放记录总数
 * @returns
 */
export function recordTotal<T extends Record<string, any>>(params: T) {
  return request<RecordTotal>({
      url: `${baseURL}record-total`,
      method: "GET",
      params
  });
}
/**
 * @说明 广播记录趋势
 * @returns
 */
export function recordTrend<T extends Record<string, any>>(params: T) {
  return request<RecordTrend[]>({
      url: `${baseURL}record-trend`,
      method: "GET",
      params
  });
}
/**
 * @说明 最新播放记录
 * @returns
 */
export function statisticsRecord<T extends Record<string, any>>(params: T) {
  return request<StatisticsRecord[]>({
      url: `${baseURL}statistics-record`,
      method: "GET",
      params
  });
}
  // 广播模板分组统计数量
export function playStatistics<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/broadcast-template/play/statistics`,
        method: "get",
        params
    });
  }
  // 广播记录列表
export function playRecordPage<T extends Record<string, any>>(params: T) {
    return request<any>({
        url: `${baseURL}/broadcast-play-record/page`,
        method: "get",
        params
    });
  }