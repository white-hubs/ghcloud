import request from "../../service/request";
const baseURL = '/api/alarm'

export const applicationCode = new Map([
  ['builtin.app::FIRECONTROL', '消防管理'],
  ['builtin.app::ELECTRICMANAGE', '电气管理'],
  ['builtin.app::GAS_MANAGEMENT', '用气管理'],
  ['builtin.app::SECURITY_MONITORING', '安防监控'],
])

export function riskIndex<T extends Record<string, any>>(params?: T) {
  return request<any>({
      url: `${baseURL}/risk-index/detail`,
      method: "GET",
      params
  });
}