type ParsedDocument = ReturnType<typeof import("linkedom").parseHTML>["document"];

/** 正文提取前移除的页面外壳（语义标签 + 常见布局类名；非目标站点上无匹配则跳过） */
export const PAGE_CHROME_SELECTORS = [
  "header",
  "nav",
  "footer",
  "aside",
  '[role="banner"]',
  '[role="navigation"]',
  '[role="complementary"]',
  '[role="contentinfo"]',
  ".site-header",
  ".site-footer",
  ".navbar",
  ".main-view",
  ".content-header",
  ".articles-layout-header",
  ".user-view",
  ".column-module",
  ".wiki-footer",
] as const;

export function stripPageChrome(document: ParsedDocument): void {
  for (const selector of PAGE_CHROME_SELECTORS) {
    for (const element of document.querySelectorAll(selector)) {
      element.remove();
    }
  }
}
