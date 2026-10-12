import { getAppFunctionCodes } from '@ghcloud/cube-permission-codes'

export const appFunctionCodes = getAppFunctionCodes('ALARM_CENTER') as unknown as Record<string, Record<string, string>>
