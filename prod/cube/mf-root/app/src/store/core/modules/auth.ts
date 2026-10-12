import { getAuthInfo } from '@ghcloud/cube-auth-utils'
import { useMfRootStore } from '../core'
import type { CubeAuth, CubeTerminalEnum } from '@ghcloud/cube-protocol'

/** 初始化鉴权 */
export const initAuthorization = async (terminal: CubeTerminalEnum): Promise<void> => {
  const store = useMfRootStore()
  const auth: CubeAuth = await getAuthInfo()
  auth.terminal = terminal
  store.setAuthInfo(auth)
};