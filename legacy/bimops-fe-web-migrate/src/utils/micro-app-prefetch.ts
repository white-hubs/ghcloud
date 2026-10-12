import { prefetchApps } from "qiankun";

import type { ApplicationPageVO, Menu } from "@ghcloud/cube-ouaa-service";

import { logMicroAppLoad } from "./micro-app-load.js";

const DEFAULT_PREFETCH_LIMIT = 5;
const prefetchedMicroAppNames = new Set<string>();

interface MicroAppConfig {
  name: string;
  entry: string;
}

interface ApplicationGroupItem {
  applicationPageVOS: ApplicationPageVO[];
}

export function resolveMicroAppNameFromPath(path: string): string | null {
  const match = path.match(/^\/portal\/([^/]+)(?:\/|$)/);
  return match?.[1] ?? null;
}

export function findFirstMenuPath(menus: Menu[]): string | null {
  for (const menu of menus) {
    if (menu.path) {
      return menu.path;
    }
    if (menu.children?.length) {
      const childPath = findFirstMenuPath(menu.children);
      if (childPath) {
        return childPath;
      }
    }
  }
  return null;
}

function getMicroAppsConfig(): MicroAppConfig[] {
  return window.config?.microApps ?? [];
}

function resolveMicroAppConfig(name: string): MicroAppConfig | undefined {
  return getMicroAppsConfig().find((item) => item.name === name);
}

export function prefetchMicroAppsByNames(names: string[]): void {
  const apps = names
    .filter((name) => !prefetchedMicroAppNames.has(name))
    .map((name) => resolveMicroAppConfig(name))
    .filter((item): item is MicroAppConfig => Boolean(item));

  if (!apps.length) {
    return;
  }

  apps.forEach((app) => prefetchedMicroAppNames.add(app.name));
  logMicroAppLoad("beforeLoad", { prefetch: apps.map((app) => app.name) });
  prefetchApps(apps);
}

export function prefetchMicroAppByPath(path: string): void {
  const name = resolveMicroAppNameFromPath(path);
  if (name) {
    prefetchMicroAppsByNames([name]);
  }
}

export function prefetchApplication(application: ApplicationPageVO): void {
  if (application.path) {
    prefetchMicroAppByPath(application.path);
    return;
  }
  const menuPath = findFirstMenuPath(application.menuVOS ?? []);
  if (menuPath) {
    prefetchMicroAppByPath(menuPath);
  }
}

export function prefetchAuthorizedMicroApps(groups: ApplicationGroupItem[], limit = DEFAULT_PREFETCH_LIMIT): void {
  const names: string[] = [];
  for (const group of groups) {
    for (const application of group.applicationPageVOS) {
      if (names.length >= limit) {
        break;
      }
      const path = application.path || findFirstMenuPath(application.menuVOS ?? []);
      const name = path ? resolveMicroAppNameFromPath(path) : null;
      if (name && !names.includes(name)) {
        names.push(name);
      }
    }
    if (names.length >= limit) {
      break;
    }
  }
  prefetchMicroAppsByNames(names);
}
