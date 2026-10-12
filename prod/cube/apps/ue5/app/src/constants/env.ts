export const APPLICATION_CODE = "three-dimensional-visualization";

/**
 * 路由 / 资源基础路径，与 Vite `base`（PUBLIC_PATH）保持一致。
 * BASE_URL 通常带尾斜杠，这里去掉以便 createWebHistory 与历史路径判断复用。
 */
export const APP_ROUTE_PREFIX = (import.meta.env.BASE_URL || "/apps/ue5").replace(/\/+$/, "") || "/";

export const USE_MOCK = false;

/** 阿里云天气市场 APPCODE，未配置时不请求第三方天气接口 */
export const ALIYUN_WEATHER_APPCODE = String(import.meta.env.VITE_ALIYUN_WEATHER_APPCODE ?? "").trim();

export const isWeatherApiAvailable = (): boolean => Boolean(ALIYUN_WEATHER_APPCODE);
