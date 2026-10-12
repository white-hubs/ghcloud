import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { authStore } from './auth-store'
export const cubeDictionaryService = new CubeDictionaryService(authStore)
