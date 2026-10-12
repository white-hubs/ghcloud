import type { SiteSetting, WebsiteSettingApi } from "../types.ts";

export function transformSetting(api: WebsiteSettingApi): SiteSetting {
  return {
    siteName: api.siteName ?? "",
    url: api.url ?? "",
    ogImage: api.ogImage ?? "",
    favicon: api.favicon ?? "",
    primaryColor: api.primaryColor ?? "",
    navStyle: api.navStyle ?? "",
    defaultTitle: api.defaultTitle ?? "",
    defaultDescription: api.defaultDescription ?? "",
    defaultKeywords: api.defaultKeywords ?? "",
    trackingScripts: api.trackingScripts ?? "",
  };
}
