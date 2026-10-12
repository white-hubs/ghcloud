const env = (import.meta as unknown as { env: { VITE_BASE_API: string; }; }).env
/** @说明 环境变量接口请求地址 */
export const baseUrl = env.VITE_BASE_API

export const URL = baseUrl + '/api'

/** 超时时间 */
export const TIMEOUT = 60000
