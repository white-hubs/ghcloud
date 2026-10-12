/**
 * 环境相关常量统一入口。
 *
 * - `APPLICATION_CODE`：vite.config.ts 注入 `__ENV__.applicationCode`
 */

export const APPLICATION_CODE: string = __ENV__.applicationCode;

/**
 * qiankun 挂载路径段，与主应用的菜单 `path` 前缀、vite.config.ts 的 `projectName` 保持一致。
 */
export const APP_ROUTE_PREFIX = "/portal/cold-storage";
