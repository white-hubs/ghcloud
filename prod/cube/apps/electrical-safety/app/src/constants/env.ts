/**
 * 环境相关常量统一入口。业务代码一律从此处读取，便于后续替换注入方式。
 *
 * 字段来源：
 * - `APPLICATION_CODE`：vite.config.ts 注入 `__ENV__.applicationCode`
 */

export const APPLICATION_CODE: string = __ENV__.applicationCode;

/**
 * qiankun 挂载路径段，与主应用的菜单 `path` 前缀、vite.config.ts 的 `projectName` 保持一致。
 * 脚手架替换点：修改此处 = 同步修改 main.ts#mount 的 base、vite.config.ts#projectName、index.html 挂载 id。
 */
export const APP_ROUTE_PREFIX = "/portal/electrical-safety";
