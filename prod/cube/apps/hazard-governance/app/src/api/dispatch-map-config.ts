import { CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import { authStore } from "./auth-store";
import { parseLntAndLat } from "@/utils/parse-lnt-lat";

const COMMAND_DISPATCH_MAP_CONFIG = "COMMAND_DISPATCH_MAP_CONFIG";

interface DictionaryItem {
  code: string;
  variable: string;
}

export const getDispatchMapCenter = async (): Promise<{ lng: number; lat: number } | null> => {
  const gateway = new CubeGateway(authStore);
  const url = `${BASE_API}/dictionary/getDataDictionaryByItem`;
  const resp = await gateway.custom<LegacyServiceError<DictionaryItem[]>>({
    url,
    query: { itemCode: COMMAND_DISPATCH_MAP_CONFIG },
    method: "GET",
  });
  const items = resp?.data ?? resp;
  if (!Array.isArray(items)) {
    return null;
  }
  const lnglatItem = items.find((item) => item.code === "lnglat");
  return parseLntAndLat(lnglatItem?.variable);
};
