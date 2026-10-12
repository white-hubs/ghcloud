import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeVisitorManagementService } from '@ghcloud/cube-visitor-management-service'
import {CubeBooksManagementService} from "@ghcloud/cube-books-management-service"
import { CubeAnnouncementService } from '@ghcloud/cube-bulletin-service'
import { authStore } from './auth-store'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'

export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
export const cubeMdataService = new CubeMdataService(authStore)
export const cubeFileService = new CubeFileService(authStore)
export const cubeVisitorManagementService = new CubeVisitorManagementService(authStore)
export const cubeBooksManagementService =new CubeBooksManagementService(authStore)
export const cubeAnnouncementService = new CubeAnnouncementService(authStore)
export const cubeSecurityManagementService = new CubeSecurityManagementService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeDictionaryService = new CubeDictionaryService(authStore)
