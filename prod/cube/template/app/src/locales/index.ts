import enUS from "./en-us";
import zhCN from "./zh-cn";
import { createI18n } from "vue-i18n";

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

export const LOCALE_STORAGE_KEY = "template-app-locale";

export function routeNameToMessageKey(routeName: string): string {
  return routeName.replace(/-([a-z])/g, (_: string, ch: string) => ch.toUpperCase());
}
