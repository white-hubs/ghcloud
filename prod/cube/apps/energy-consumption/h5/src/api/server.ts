import { CubeEnergyManagementService } from '@ghcloud/cube-energy-consumption-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { authStore } from './auth-store'

export const cubeEnergyManagementService = new CubeEnergyManagementService(authStore)
export const cubeMdataService = new CubeMdataService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
