import { BASE_API } from "@ghcloud/cube-protocol";

const APP_CONFIG_ITEM_CODE = "HIGREEN_DATA_VIZ_APP_CONFIG";
const DICTIONARY_APP_CONFIG_URL = `${BASE_API}/dictionary/getSysDictionaryByCodeAndItemCode`;

interface AppConfig {
  documentTitle: string;
  homeTitle: string;
  dataVizTitle: string;
}

interface DictionaryItem {
  variable?: string;
}

interface LegacyServiceResponse<T> {
  data?: T;
}

const defaultAppConfig: AppConfig = {
  documentTitle: "海吉星·光明运营大屏",
  homeTitle: "海吉星·光明智慧管理平台",
  dataVizTitle: "海吉星·光明数据可视化平台",
};

export const appConfig: AppConfig = { ...defaultAppConfig };

export function getAppDocumentTitle(routeName?: string | symbol | null): string {
  if (routeName === "entry") {
    return appConfig.dataVizTitle;
  }
  if (routeName === "index" || routeName === "NotFound") {
    return appConfig.homeTitle;
  }
  return appConfig.documentTitle;
}

export function updateAppDocumentTitle(routeName?: string | symbol | null): void {
  document.title = getAppDocumentTitle(routeName);
}

export async function initAppConfig(): Promise<void> {
  try {
    const url = new URL(DICTIONARY_APP_CONFIG_URL, window.location.origin);
    url.searchParams.set("itemCode", APP_CONFIG_ITEM_CODE);
    url.searchParams.set("code", APP_CONFIG_ITEM_CODE);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const responseBody = (await response.json()) as LegacyServiceResponse<DictionaryItem> | DictionaryItem;
    const res = "data" in responseBody && responseBody.data ? responseBody.data : responseBody;
    const config = res.variable ? (JSON.parse(res.variable) as Partial<AppConfig>) : {};

    Object.assign(appConfig, config);
  } catch (error) {
    console.error("初始化应用配置失败:", error);
  }

  updateAppDocumentTitle();
}
