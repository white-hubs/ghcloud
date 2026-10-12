/**
 * 环境相关常量统一入口。业务代码一律从此处读取，便于后续替换注入方式。
 *
 * 字段来源：
 * - `APPLICATION_CODE`：vite.config.ts 注入 `__ENV__.applicationCode`
 */

export const APPLICATION_CODE: string = __ENV__.applicationCode;
