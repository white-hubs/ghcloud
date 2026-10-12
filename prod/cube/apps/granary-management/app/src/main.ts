import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

import { getAuthInfo, setAuthInfo } from "@ghcloud/cube-auth-utils";
import { BASE_API, CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";
import { genericAuthStore as initGenericComponentAuth } from "@ghcloud/generic-component/src/api/auth-store";

import { initAuthStore } from "./api/auth-store";
import { Application } from "./app";
import { logger } from "./logger";

const appBasePath = "/portal/granary-management";
const DICTIONARY_CLIENT_INFO_URL = `${BASE_API}/dictionary/getSysDictionaryByCodeAndItemCode`;
const CLIENT_LOGIN_URL = `${BASE_API}/ouaa/oauth2/token`;
const MAX_DATA_PEEL = 5;

type RouteParams = Record<string, string | undefined>;

interface ClientInfoConfig {
  appId: string;
  key: string;
}

interface ClientAuthInfo {
  token: string;
  tenant: string;
  terminal: CubeTerminalEnum;
}

const getCurrentRouteParams = (): RouteParams => {
  const params: RouteParams = {};
  const collect = (raw: string): void => {
    if (raw === "") {
      return;
    }
    const search = raw.startsWith("?") ? raw.slice(1) : raw;
    new URLSearchParams(search).forEach((value, key) => {
      params[key] = value;
    });
  };
  collect(window.location.search);
  const hashQueryIndex = window.location.hash.indexOf("?");
  if (hashQueryIndex >= 0) {
    collect(window.location.hash.slice(hashQueryIndex + 1));
  }
  return params;
};

const pickHostBearerToken = (auth: QiankunProps["auth"] | undefined): string => {
  if (auth == null) {
    return "";
  }
  if (typeof auth.token === "string" && auth.token.trim() !== "") {
    return auth.token;
  }
  const withAccess = auth as { access_token?: string };
  if (typeof withAccess.access_token === "string" && withAccess.access_token.trim() !== "") {
    return withAccess.access_token;
  }
  return "";
};

const unwrapGatewayData = (raw: unknown): unknown => {
  let v: unknown = raw;
  for (let d = 0; d < MAX_DATA_PEEL; d += 1) {
    if (v != null && typeof v === "object" && !Array.isArray(v) && "data" in (v as Record<string, unknown>)) {
      const next = (v as { data: unknown }).data;
      if (next === undefined) {
        break;
      }
      v = next;
    } else {
      break;
    }
  }
  return v;
};

const readText = (source: Record<string, unknown>, ...keys: string[]): string => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return "";
};

const parseMaybeJsonObject = (raw: unknown): Record<string, unknown> | null => {
  if (raw != null && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw !== "string") {
    return null;
  }
  const text = raw.trim();
  if (text === "") {
    return null;
  }
  try {
    const parsed = JSON.parse(text) as unknown;
    if (parsed != null && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    const quotedParts = Array.from(text.matchAll(/"([^"]*)"/g)).map((match) => match[1]);
    if (quotedParts.length >= 2 && quotedParts.length % 2 === 0) {
      const paired: Record<string, string> = {};
      for (let i = 0; i < quotedParts.length; i += 2) {
        paired[quotedParts[i]] = quotedParts[i + 1];
      }
      return paired;
    }
    const params = new URLSearchParams(text);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return Object.keys(result).length > 0 ? result : null;
  }
  return null;
};

const collectClientInfoCandidates = (value: unknown): Record<string, unknown>[] => {
  const normalized = unwrapGatewayData(value);
  if (Array.isArray(normalized)) {
    return normalized.flatMap(collectClientInfoCandidates);
  }
  const objectValue = parseMaybeJsonObject(normalized);
  if (objectValue == null) {
    return [];
  }
  const result: Record<string, unknown>[] = [objectValue];
  for (const key of ["variable", "variables", "client", "clientInfo", "client_info", "data"]) {
    if (key in objectValue) {
      result.push(...collectClientInfoCandidates(objectValue[key]));
    }
  }
  return result;
};

const parseClientInfoConfig = (raw: unknown): ClientInfoConfig | null => {
  for (const config of collectClientInfoCandidates(raw)) {
    const appId = readText(config, "appid", "appId", "clientId", "client_id");
    const key = readText(config, "key", "appKey", "clientSecret", "client_secret", "secret");
    if (appId !== "" && key !== "") {
      return { appId, key };
    }
  }
  return null;
};

const getClientInfoConfig = async (): Promise<ClientInfoConfig> => {
  const url = new URL(DICTIONARY_CLIENT_INFO_URL, window.location.origin);
  url.searchParams.set("itemCode", "FRONTEND_CONFIG");
  url.searchParams.set("code", "CLIENT_INFO");
  const resp = await fetch(url.toString());
  if (!resp.ok) {
    throw new Error(`Client info dictionary request failed: ${resp.status}`);
  }
  const config = parseClientInfoConfig(await resp.json());
  if (config == null) {
    throw new Error("CLIENT_INFO dictionary is invalid");
  }
  return config;
};

const clientLogin = async (config: ClientInfoConfig): Promise<ClientAuthInfo> => {
  const form = new URLSearchParams();
  form.set("grant_type", "client_credentials");
  form.set("client_id", config.appId);
  form.set("client_secret", config.key);
  const resp = await fetch(new URL(CLIENT_LOGIN_URL, window.location.origin).toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
  if (!resp.ok) {
    throw new Error(`Client login failed: ${resp.status}`);
  }
  const data = unwrapGatewayData(await resp.json());
  if (data == null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Client login response is invalid");
  }
  const row = data as Record<string, unknown>;
  const token = readText(row, "access_token", "accessToken", "token");
  const tenants = row.tenants;
  const tenant = Array.isArray(tenants) ? String(tenants[0] ?? "").trim() : readText(row, "tenant");
  const terminal = readText(row, "terminal") || CubeTerminalEnum.BUSINESS;
  if (token === "") {
    throw new Error("Client login token is empty");
  }
  return { token, tenant, terminal: terminal as CubeTerminalEnum };
};

const tryGetSecretAuthFromSession = (): CubeAuth | null => {
  const params = getCurrentRouteParams();
  if (params["cube-secret"] == null || params["cube-secret"] === "") {
    return null;
  }
  const tokenRaw = sessionStorage.getItem("GH-Token");
  if (tokenRaw == null || tokenRaw === "") {
    return null;
  }
  try {
    const parsedToken = JSON.parse(tokenRaw) as { access_token?: unknown };
    const token = typeof parsedToken.access_token === "string" ? parsedToken.access_token.trim() : "";
    if (token === "") {
      return null;
    }
    let tenant = params.tenant ?? "";
    const enterpriseRaw = sessionStorage.getItem("GH-NowEnterprise");
    if (tenant === "" && enterpriseRaw != null && enterpriseRaw !== "") {
      const parsedEnterprise = JSON.parse(enterpriseRaw) as { code?: unknown };
      tenant = typeof parsedEnterprise.code === "string" ? parsedEnterprise.code : "";
    }
    if (tenant === "") {
      return null;
    }
    return {
      token,
      tenant,
      terminal: (params.terminal ?? CubeTerminalEnum.BUSINESS) as CubeTerminalEnum,
    };
  } catch {
    return null;
  }
};

const isPublicWarehouseDetailRoute = (): boolean => {
  const params = getCurrentRouteParams();
  if (params.wid == null || params.wid === "") {
    return false;
  }
  const pathText = `${window.location.pathname}${window.location.hash}`;
  return pathText.includes("/main-management/warehouse-detail");
};

const getPublicDashboardAuth = async (): Promise<CubeAuth | null> => {
  if (!isPublicWarehouseDetailRoute()) {
    return null;
  }
  const config = await getClientInfoConfig();
  const auth = await clientLogin(config);
  return auth;
};

const removeCubeSecretFromUrl = (): void => {
  const url = new URL(window.location.href);
  url.searchParams.delete("cube-secret");
  const hash = url.hash;
  const hashQueryIndex = hash.indexOf("?");
  if (hashQueryIndex >= 0) {
    const hashPath = hash.slice(0, hashQueryIndex);
    const hashSearch = new URLSearchParams(hash.slice(hashQueryIndex + 1));
    hashSearch.delete("cube-secret");
    const nextHashSearch = hashSearch.toString();
    url.hash = nextHashSearch === "" ? hashPath : `${hashPath}?${nextHashSearch}`;
  }
  window.history.replaceState(window.history.state, document.title, url.toString());
};

class Main {
  public static run(): void {
    new Main().init();
  }

  private app?: Application;

  private constructor() {}

  public init(): void {
    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
      this.renderWithDefault();
      return;
    }

    this.renderWithQiankun();
  }

  private renderWithDefault(): void {
    void this.bootstrapStandalone();
  }

  private async bootstrapStandalone(): Promise<void> {
    try {
      const publicDashboardAuth = await getPublicDashboardAuth();
      const restoredAuth = tryGetSecretAuthFromSession();
      const fromUrl = publicDashboardAuth ?? restoredAuth ?? (await getAuthInfo());
      if (restoredAuth != null) {
        removeCubeSecretFromUrl();
      }
      initAuthStore(fromUrl);
      setAuthInfo(fromUrl);
      this.app = new Application({});
      await this.app.install();
    } catch (error: unknown) {
      logger.error(error);
    }
  }

  private renderWithQiankun(): void {
    renderWithQiankun({
      bootstrap: this.bootstrap.bind(this),
      mount: this.mount.bind(this),
      unmount: this.unmount.bind(this),
      update: this.update.bind(this),
    });
  }

  private bootstrap(): void {
    logger.debug("bootstrap");
  }

  private async mount(props: QiankunProps): Promise<void> {
    this.app = new Application({ base: appBasePath, ...props });
    const publicDashboardAuth = await getPublicDashboardAuth();
    const hostBearer = pickHostBearerToken(props.auth);
    const hasHostToken = hostBearer !== "";
    const restoredAuth = publicDashboardAuth != null || hasHostToken ? null : tryGetSecretAuthFromSession();
    const fromUrl =
      publicDashboardAuth != null
        ? publicDashboardAuth
        : hasHostToken
          ? {
              token: hostBearer,
              tenant: props.auth?.tenant ?? "",
              terminal: (props.auth?.terminal ?? CubeTerminalEnum.BUSINESS) as CubeTerminalEnum,
            }
          : (restoredAuth ?? (await getAuthInfo()));
    if (restoredAuth != null) {
      removeCubeSecretFromUrl();
    }
    const merged: CubeAuth = {
      token: publicDashboardAuth != null ? fromUrl.token : hostBearer !== "" ? hostBearer : (props.auth?.token ?? fromUrl.token),
      tenant: publicDashboardAuth != null ? fromUrl.tenant : (props.auth?.tenant ?? fromUrl.tenant),
      terminal: (publicDashboardAuth != null
        ? fromUrl.terminal
        : (props.auth?.terminal ?? fromUrl.terminal ?? CubeTerminalEnum.BUSINESS)) as CubeTerminalEnum,
    };
    initAuthStore(merged);
    setAuthInfo(merged);
    initGenericComponentAuth(merged);
    await this.app.install();
  }

  private unmount(props: QiankunProps): void {
    logger.debug("unmount", props);
    this.app?.uninstall();
  }

  private update(props: QiankunProps): void {
    logger.debug("update", props);
  }
}

Main.run();
