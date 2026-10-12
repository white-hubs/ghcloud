import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeTerminalEnum } from '@ghcloud/cube-protocol'

export const authStore = {
  tenant: '',
  terminal: CubeTerminalEnum.BUSINESS,
  token: '',
}

export let cubeDictionaryService = new CubeDictionaryService(authStore)
export let cubeMdataService = new CubeMdataService(authStore)
export let cubeOuaaService = new CubeOuaaService(authStore)
export const reloadService = (): void => {
  cubeDictionaryService = new CubeDictionaryService(authStore)
  cubeMdataService = new CubeMdataService(authStore)
  cubeOuaaService = new CubeOuaaService(authStore)
}
export const initAuthStore = (auth: { tenant: string; token: string; }): void => {
  authStore.tenant = auth.tenant
  authStore.token = auth.token
  reloadService()
}
