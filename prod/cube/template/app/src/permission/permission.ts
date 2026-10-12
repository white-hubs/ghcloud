import { getAppFunctionCodes } from '@ghcloud/cube-permission-codes'
import { APPLICATION_CODE } from '@/constants/env'

/**
 * 应用内功能点权限码集合。
 *
 * - 业务组件按需：`appFunctionCodes.DEMO_LIST?.CREATE` 等
 * - 若 `@ghcloud/cube-permission-codes` 尚未覆盖当前应用的权限码，`getAppFunctionCodes` 返回空对象，相关位置按"无权限"处理
 * - 新增权限码需在 `cube-permission-codes` 中登记，不要在应用内硬编码
 */
export const appFunctionCodes = getAppFunctionCodes(APPLICATION_CODE) as unknown as Record<string, Record<string, string>>
