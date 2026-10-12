import { createI18n } from "vue-i18n";

import enUS from "./en-us";
import zhCN from "./en-zh";

export const DEFAULT_LOCALE = "zh-CN";

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: "en-US",
  messages: {
    "zh-CN": zhCN,
    "en-US": enUS,
  },
});

export const LOCALE_STORAGE_KEY = "intelligent-grain-locale";

export function routeNameToMessageKey(routeName: string): string {
  return routeName.replace(/-([a-z])/g, (_: string, ch: string) => ch.toUpperCase());
}
