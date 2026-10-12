import request from "../service/request";
import { AreaType, ReturnAreaScenePanelConfig, SceneDataType } from "./models/mdata";
const baseURL = '/api/safety-education/'
/**
 * @说明 安全教育统计
 * @returns
 */
export function getSafetyEdu<T extends Record<string, any>>(params?: T) {
  return request({
      url: baseURL + "/education-statistics/task/chain-ratio",
      method: "GET",
      params,
  });
}
/**
 * 安全教育主题统计
 */
export function getSafetyEduTheme<T extends Record<string, any>>(params?: T) {
  return request({
      url: baseURL + "/education-statistics/themes",
      method: "GET",
      params,
  })
}
/**
 * 安全教育培训任务
 */
export function cultivateTaskPage<T extends Record<string, any>>(params?: T) {
  return request({
      url: baseURL + "/cultivate-task/page",
      method: "GET",
      params,
  })
}
/**
 * 安全教育考试任务
 */
export function examTaskPage<T extends Record<string, any>>(params?: T) {
  return request({
      url: baseURL + "/exam-task/page",
      method: "GET",
      params,
  })
}
