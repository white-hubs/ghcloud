import type { SiteLayoutApi, SitePage, SitePageApi } from "../types.ts";

export function transformPages(apiPages: SitePageApi[], layouts: SiteLayoutApi[]): SitePage[] {
  // 建立 layoutId -> layoutName 映射
  const layoutNameMap = new Map<string | number, string | undefined>();
  for (const layout of layouts) {
    layoutNameMap.set(layout.id, layout.layoutName);
  }

  return apiPages.map((page) => {
    // API 返回的是 layoutId，不是 layoutName
    const rawLayoutId = page.layoutId ?? page.layout;
    const layoutName = rawLayoutId ? (layoutNameMap.get(rawLayoutId) ?? rawLayoutId) : rawLayoutId;
    return {
      id: page.id,
      pageRoute: page.pageRoute,
      layout: layoutName,
      metaTitle: page.metaTitle ?? "",
      metaDescription: page.metaDescription ?? "",
      metaKeywords: page.metaKeywords ?? "",
      metaNavStyle: page.metaNavStyle ?? "",
      components: page.components || "[]",
    };
  });
}
