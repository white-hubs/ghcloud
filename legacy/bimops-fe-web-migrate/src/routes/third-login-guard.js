import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";
import { CubeTerminalEnum } from "@ghcloud/cube-protocol";
import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";
import * as api from "@/api";

const THIRD_LOGIN_QUERY_KEY = "thirdLogin";
const THIRD_LOGIN_QUERY_VALUE = "1";
const THIRD_LOGIN_DICT_CODE = "XIANING_CUS_LOGIN";

const pickTenantFromList = (tenants = []) => {
  if (!Array.isArray(tenants) || tenants.length === 0) {
    return "";
  }
  if (tenants.length === 1) {
    return tenants[0].code || "";
  }
  const mainTenant = tenants.find((item) => item.mainEnterprise);
  return mainTenant?.code || tenants[0].code || "";
};

const sanitizeThirdLoginQuery = (query = {}) => {
  const nextQuery = { ...query };
  delete nextQuery[THIRD_LOGIN_QUERY_KEY];
  return nextQuery;
};

const isThirdLoginEnabled = async () => {
  try {
    const res = await new CubeDictionaryService().getSysDictionaryByCodeAndItemCode({
      itemCode: THIRD_LOGIN_DICT_CODE,
      code: THIRD_LOGIN_DICT_CODE,
    });
    return res?.variable === "true";
  } catch (error) {
    return false;
  }
};

const loginByThirdPlatform = async () => {
  try {
    const cubeMfRootGlobalState = CubeMfRootGlobalState.getInstance();
    const result = await api.getWarehouseLoginInfo();
    const token = result?.access_token || result?.token;
    const refreshToken = result?.refresh_token || result?.refreshToken;
    if (!token) {
      return false;
    }
    let tenant = String(result?.tenant || "");
    cubeMfRootGlobalState.mfRootState.setAuthInfo(
      {
        token,
        tenant,
        terminal: CubeTerminalEnum.BUSINESS,
      },
      refreshToken,
    );
    if (!tenant) {
      const tenantList = await api.tenant();
      tenant = pickTenantFromList(tenantList);
      if (!tenant) {
        return false;
      }
      cubeMfRootGlobalState.mfRootState.setAuthInfo({
        ...cubeMfRootGlobalState.mfRootState.authInfo,
        tenant,
      });
    }
    await cubeMfRootGlobalState.initGlobalState();
    return true;
  } catch (error) {
    return false;
  }
};

export const handleThirdLoginGuard = async ({ to, authInfo, portalStore, next }) => {
  const isThirdLoginRoute = to.query?.[THIRD_LOGIN_QUERY_KEY] === THIRD_LOGIN_QUERY_VALUE;
  if (!isThirdLoginRoute) {
    return false;
  }
  const cleanedQuery = sanitizeThirdLoginQuery(to.query);
  if (authInfo?.token) {
    portalStore?.syncFromRoute(to);
    next({ path: to.path, query: cleanedQuery, hash: to.hash, replace: true });
    return true;
  }
  const enabled = await isThirdLoginEnabled();
  if (!enabled) {
    return false;
  }
  const loginSuccess = await loginByThirdPlatform();
  if (!loginSuccess) {
    return false;
  }
  portalStore?.syncFromRoute({ ...to, query: cleanedQuery });
  next({
    path: to.path,
    query: cleanedQuery,
    hash: to.hash,
    replace: true,
  });
  return true;
};
