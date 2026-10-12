import {
  getAuthHeaders,
  getEnvironment,
  initAuthHeadersByCubeAppBridge,
  waitCubeAppReady,
} from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import { CubeAuthService } from "@ghcloud/cube-auth-service";
import { type CubeAuth, CubeTerminalEnum } from "@ghcloud/cube-protocol";
import { CubeMessageEvent } from "@ghcloud/cube-protocol";
// 定义一个接口来描述路由参数的结构
type RouteParams = Record<string, string | undefined>;

declare global {
  interface Window {
    cubeElectronIpcRenderer?: any;
    __CUBE_AUTH_INFO__?: CubeAuth;
  }
}

export function getRouteParams(): RouteParams {
  // 使用 window.location.hash 获取hash路由部分，使用search获取查询参数部分
  const hash = window.location.hash.substring(1); // 移除开头的井号
  const search = window.location.search.substring(1); // 移除开头的问号

  // 创建一个对象来存储参数
  const params: RouteParams = {};

  // 如果存在hash部分，解析hash参数
  if (hash) {
    const hashParts = hash.split("?");
    if (hashParts.length > 1) {
      const hashParams = new URLSearchParams(hashParts[1]);
      hashParams.forEach((value, key) => {
        params[key] = value;
      });
    }
  }

  // 如果存在查询参数部分，解析查询参数
  if (search) {
    const queryParams = new URLSearchParams(search);
    queryParams.forEach((value, key) => {
      params[key] = value;
    });
  }

  // 返回包含所有路由参数的对象
  return params;
}

async function getAuthInfoFromClient(): Promise<typeof window.__CUBE_AUTH_INFO__> {
  return new Promise((resolve) => {
    window.addEventListener("message", (event) => {
      if (event.data.type === CubeMessageEvent.GET_AUTH_INFO) {
        resolve(event.data.data);
        // 立即移除监听
        window.removeEventListener("message", (event) => {
          if (event.data.type === CubeMessageEvent.GET_AUTH_INFO) {
            resolve(event.data.data);
          }
        });
      }
    });
    window.parent.postMessage({ type: CubeMessageEvent.GET_AUTH_INFO }, "*");
  });
}

export const getAuthInfoByGLobal = (): typeof window.__CUBE_AUTH_INFO__ | null => {
  if (window?.__CUBE_AUTH_INFO__?.token) {
    return window.__CUBE_AUTH_INFO__;
  } else {
    return null;
  }
};

export const getAuthInfo = async (): Promise<CubeAuth> => {
  const globalAuth = getAuthInfoByGLobal();
  if (globalAuth?.token) {
    return globalAuth;
  }
  const authStore = {
    token: window.__CUBE_AUTH_INFO__?.token ?? "",
    tenant: window.__CUBE_AUTH_INFO__?.tenant ?? "",
    terminal: window.__CUBE_AUTH_INFO__?.terminal ?? CubeTerminalEnum.BUSINESS,
  };
  const runningEnvironment = getEnvironment();
  const params = getRouteParams();
  if (runningEnvironment === "cubeApp") {
    try {
      await waitCubeAppReady();
      await initAuthHeadersByCubeAppBridge();
      const authHeaders = getAuthHeaders();
      authStore.token = authHeaders.Authorization.slice(7);
      authStore.tenant = authHeaders.tenant;
      authStore.terminal = authHeaders.terminal as CubeTerminalEnum;
    } catch {
      alert("桥接获取授权信息失败");
      throw new Error("桥接获取授权信息失败");
    }
  } else if (runningEnvironment === "cubeDesktopClient") {
    const res = await getAuthInfoFromClient();
    if (res) {
      authStore.token = res.token;
      authStore.tenant = res.tenant;
      authStore.terminal = res.terminal;
    }
  } else if (params.client_id) {
    const data = {
      grant_type: "client_credentials",
      client_id: params.client_id,
      client_secret: params.client_secret ?? "",
    };
    const cubeAuthService = new CubeAuthService(authStore.terminal);
    const result = await cubeAuthService.getAuthByClientLogin(data);
    authStore.token = result.accessToken;
    // !authStore.tenant && result.tenant && (authStore.tenant = result.tenant)
    // !authStore.terminal && result.terminal && (authStore.terminal = result.terminal as CubeTerminalEnum)
  } else if (params.access_token) {
    authStore.token = params.access_token ?? "";
    authStore.tenant = params.tenant ?? "";
    authStore.terminal = (params.terminal as CubeTerminalEnum) ?? CubeTerminalEnum.BUSINESS;
  } else if (sessionStorage.getItem("GH-Token") && sessionStorage.getItem("GH-NowEnterprise")) {
    authStore.token = (JSON.parse(sessionStorage.getItem("GH-Token") as unknown as string) as { access_token: string }).access_token;
    authStore.tenant = (JSON.parse(sessionStorage.getItem("GH-NowEnterprise") as unknown as string) as { code: string }).code;
  } else {
    authStore.token = params.access_token ?? "";
    authStore.tenant = params.tenant ?? "";
    authStore.terminal = (params.terminal as CubeTerminalEnum) ?? CubeTerminalEnum.BUSINESS;
    if (params["cube-secret"]) {
      const cubeAuthService = new CubeAuthService(authStore.terminal as CubeTerminalEnum);
      const result = await cubeAuthService.getTokenBySecret(params["cube-secret"]);
      sessionStorage.setItem(
        "GH-Token",
        JSON.stringify({
          access_token: result.accessToken,
        }),
      );
      sessionStorage.setItem("GH-NowEnterprise", JSON.stringify({ code: result.tenant }));
      authStore.token = result.accessToken;
      !authStore.tenant && result.tenant && (authStore.tenant = result.tenant);
      !authStore.terminal && result.terminal && (authStore.terminal = result.terminal as CubeTerminalEnum);
    }
  }
  window.__CUBE_AUTH_INFO__ = authStore;
  return authStore;
};

export const setAuthInfo = (auth: CubeAuth): void => {
  window.__CUBE_AUTH_INFO__ = auth;
};
