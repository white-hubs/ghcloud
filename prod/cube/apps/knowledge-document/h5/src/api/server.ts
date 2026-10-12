import { CubeMaintainService } from '@ghcloud/cube-maintain-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { authStore } from './auth-store'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeKnowledgeDocumentService } from '@ghcloud/cube-knowledge-document-service'

export const cubeMaintainService = new CubeMaintainService(authStore)
export const cubeMdataService = new CubeMdataService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeFileService = new CubeFileService(authStore)
export const cubeDictionaryService = new CubeDictionaryService(authStore)
export const cubeKnowledgeDocumentService = new CubeKnowledgeDocumentService(authStore)
