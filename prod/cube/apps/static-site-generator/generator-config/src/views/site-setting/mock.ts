import type { FileVOState } from "@ghcloud/cube-protocol";

export interface SiteSettingFormState {
  id: string;
  siteName: string;
  url: string;
  ogImage: string;
  favicon: string;
  primaryColor: string;
  navStyle: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  trackingScripts: string[];
}

export function getOgImageFiles(ogImage: string): FileVOState[] {
  return ogImage ? [{ id: "og-image", path: ogImage }] : [];
}

export function getFaviconFiles(favicon: string): FileVOState[] {
  return favicon ? [{ id: "favicon", path: favicon }] : [];
}
