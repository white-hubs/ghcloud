import { BASE_API, CubeHeaders, CubeTerminalEnum } from "@ghcloud/cube-protocol";

import { authStore } from "./auth-store";
import { parseLntAndLat } from "@/utils/parse-lnt-lat";

const COMMAND_DISPATCH_MAP_CONFIG = "COMMAND_DISPATCH_MAP_CONFIG";

interface DictionaryItem {
  code: string;
  variable: string;
}

interface LegacyServiceResponse<T> {
  data?: T;
}

export const getDispatchMapCenter = async (): Promise<{ lng: number; lat: number } | null> => {
  const url = new URL(`${BASE_API}/dictionary/getDataDictionaryByItem`, window.location.origin);
  url.searchParams.set("itemCode", COMMAND_DISPATCH_MAP_CONFIG);
  const resp = (await fetch(url.toString(), {
    method: "GET",
    headers: {
      [CubeHeaders.AUTHORIZATION]: `Bearer ${authStore.token}`,
      [CubeHeaders.TERMINAL]: authStore.terminal || CubeTerminalEnum.BUSINESS,
      [CubeHeaders.TENANT]: String(authStore.tenant || ""),
    },
  }).then((response) => response.json())) as LegacyServiceResponse<DictionaryItem[]> | DictionaryItem[];
  const items = resp?.data ?? resp;
  if (!Array.isArray(items)) {
    return null;
  }
  const lnglatItem = items.find((item) => item.code === "lnglat");
  return parseLntAndLat(lnglatItem?.variable);
};
