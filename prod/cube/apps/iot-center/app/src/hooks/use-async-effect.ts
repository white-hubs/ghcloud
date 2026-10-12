import { useEffect } from 'react'

/**
 *
 * @param handler 异步 handler，注意，与原始的 useEffect 不同的是，该方法不支持返回 clearHandler
 * @param deps 依赖项
 */
export function useAsyncEffect (handler: () => Promise<void>, deps: unknown[]): void {
  useEffect(() => {
    handler()
  }, deps)
}
