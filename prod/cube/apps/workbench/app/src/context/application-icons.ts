import type { InjectionKey } from "vue";

export type ApplicationIconMap = Readonly<Record<string, string>>;

export const applicationIconMapKey: InjectionKey<Promise<ApplicationIconMap>> = Symbol("application-icon-map");

/** 优先菜单自身 icon，否则回落到应用 code 对应的应用图标 */
export function resolveFrequentMenuIcon(menu: { icon?: string; applicationCode?: string }, applicationIcons: ApplicationIconMap): string {
  return menu.icon || (menu.applicationCode ? applicationIcons[menu.applicationCode] : "") || "";
}
