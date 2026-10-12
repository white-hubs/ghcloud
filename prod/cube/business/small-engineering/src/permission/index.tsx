import { getAppFunctionCodes } from '@ghcloud/cube-permission-codes'
const appInfo = JSON.parse(sessionStorage.getItem('GH-currentApplication') as unknown as string) as { code: string; }
export const appFunctionCodes = getAppFunctionCodes(appInfo.code) as unknown as Record<string, Record<string, string>>
