import { message } from '@ghcloud/cube-ui'

export function showApiError (err: unknown, fallback = '请求失败'): void {
  const msg = err instanceof Error ? err.message : fallback
  message.error(msg || fallback)
}
