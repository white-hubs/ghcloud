import { getAppFunctionCodes } from '@ghcloud/cube-permission-codes'

const appInfoRaw = sessionStorage.getItem('GH-currentApplication')
const appInfo = appInfoRaw != null ? JSON.parse(appInfoRaw) as { code?: string } : {}

export const appFunctionCodes = getAppFunctionCodes(appInfo.code ?? '') as Record<string, Record<string, string>>
