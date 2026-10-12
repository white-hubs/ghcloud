import { withContext } from '@ghcloud/cube-ouaa-service'
import type { CubeGatewayRequestOptions } from '@ghcloud/cube-gateway'
import { CubeHeaders } from '@ghcloud/cube-protocol'
import { authStore } from '@/state/auth'

// TODO: 这里只是一个示例，后续使用新版 gateway 调用方式可将其提升为组件包
export const useAuthRequest = <T>(fn: () => T): T => {
  return withContext<T>((options: CubeGatewayRequestOptions): CubeGatewayRequestOptions => {
    const headers = new Headers(options.headers)
    const auth = authStore.value
    if (!auth) {
      throw new Error('Login state is not ready!')
    }
    headers.set(CubeHeaders.AUTHORIZATION, `Bearer ${auth.access_token}`)
    headers.set(CubeHeaders.TENANT, `${auth.tenant}`)
    headers.set(CubeHeaders.TERMINAL, auth.terminal)
    options.headers = headers
    return options
  }, fn);
}
