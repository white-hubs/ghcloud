import { logger } from '@/logger'
import type { LoginResponse } from '@ghcloud/cube-ouaa-service'
import type { CubeTerminalEnum } from '@ghcloud/cube-protocol'
import { ref, watch, type Ref } from 'vue'

interface AuthState extends LoginResponse {
  tenant: number;
  terminal: CubeTerminalEnum;
}

let sessionAuth: AuthState | undefined = undefined;
try {
  const cacheAuth = sessionStorage.getItem('auth')
  if (cacheAuth) {
    sessionAuth = JSON.parse(cacheAuth) as AuthState
  }
} catch (error) {
  logger.error('Failed to get auth from session storage', error)
}
export const authStore: Ref<AuthState | undefined> = ref(sessionAuth)

watch(authStore, (newVal) => {
  if (newVal) {
    sessionStorage.setItem('auth', JSON.stringify(newVal))
  }
})

export const cleanAuth = (): void => {
  authStore.value = undefined
  sessionStorage.removeItem('auth')
}
