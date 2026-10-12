import { FUNCTION_PERMISSION_CODES } from './function-permission-codes';

export const getAppFunctionCodes = (appCode: string): Record<string, Record<string, string>> | undefined => {
  const appCodes = FUNCTION_PERMISSION_CODES.find((item) => item.applicationCode === appCode);
  if (!appCodes) {
    return {};
  }

  const res = appCodes.children.reduce<Record<string, Record<string, string>>>((pre, cur) => {
    return {
      ...pre,
      [cur.groupCode]: cur.features.reduce<Record<string, string>>((featPre, featCur) => {
        const featureCodeParts = featCur.featureCode.split(':');
        const lastPart = featureCodeParts[featureCodeParts.length - 1]; // 获取最后一部分
        return {
          ...featPre,
          [lastPart]: featCur.featureCode
        };
      }, {})
    };
  }, {});

  return res;
};
