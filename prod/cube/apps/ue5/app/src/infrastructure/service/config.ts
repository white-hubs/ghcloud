/** @说明 环境变量 */
const ENV = import.meta.env;
/**@说明 环境变量接口请求地址*/
export const BASE_URL = ENV.VITE_BASE_API;

export const URL = BASE_URL + "/api";

/** 超时时间 */
export const TIMEOUT = 60000;
