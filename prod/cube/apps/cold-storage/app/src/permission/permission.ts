import { getAppFunctionCodes } from "@ghcloud/cube-permission-codes";

import { APPLICATION_CODE } from "@/constants/env";

export const appFunctionCodes = getAppFunctionCodes(APPLICATION_CODE) as unknown as Record<string, Record<string, string>>;
