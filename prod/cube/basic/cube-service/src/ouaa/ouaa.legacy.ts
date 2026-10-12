/**
 * 该文件内容系开河重构过程中，短期无法撸掉的旧时产物，如果相关方法已不存在调用者，请立即删除该文件
 */

import type { Tenant } from './ouaa.model'

export function legacyCacheToken (record: Record<string, unknown>): void {
  sessionStorage.setItem('GH-Token', JSON.stringify(record))
}

export function legacyCacheTenant (tenant: Tenant): void {
  sessionStorage.setItem('GH-NowEnterprise', JSON.stringify(tenant))
}
