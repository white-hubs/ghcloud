import type { SiteLayout, SiteLayoutApi } from "../types.ts";

export function transformLayouts(apiLayouts: SiteLayoutApi[]): SiteLayout[] {
  return apiLayouts.map((layout) => ({
    id: layout.id,
    layoutName: layout.layoutName,
    config: layout.config,
  }));
}
