// oxlint-disable no-magic-numbers
// oxlint-disable typescript/no-explicit-any
import type { Article, ArticleCategoryTree, SiteLayoutVO, SitePageVO, WebsiteSetting } from "@ghcloud/cube-static-site-generator-service";

// ================== 从 generator-cli/src/utils/binding.ts 复刻 ==================

export function resolveBinding(value: string, data: Record<string, any>): string | any[] {
  if (typeof value !== "string") return value;
  const pattern = /^\$\{([\w.]+)\}$/;
  const exactMatch = value.match(pattern);
  if (exactMatch) {
    const key = exactMatch[1];
    if (data[key] !== undefined) {
      return data[key];
    }
  }

  const replacePattern = /\$\{([\w.]+(?:\[\d+\])?)\}/g;
  return value.replace(replacePattern, (_, path) => {
    const match = path.match(/^([\w.]+)\[(\d+)\]\.(.+)$/);
    if (match) {
      const [, arrayKey, index, rest] = match;
      const arr = data[arrayKey];
      return arr?.[parseInt(index)]?.[rest] ?? "";
    }

    const simpleArrayMatch = path.match(/^([\w.]+)\[(\d+)\]$/);
    if (simpleArrayMatch) {
      const [, arrayKey, index] = simpleArrayMatch;
      return data[arrayKey]?.[parseInt(index)] ?? "";
    }

    const keys = path.split(".");
    let result = data;
    for (const key of keys) {
      result = result?.[key];
    }
    return result ?? "";
  });
}

function resolveRef(value: Record<string, any>, data: Record<string, any>): any {
  if (value.$ref && typeof value.$ref === "string") {
    const ref = value.$ref;
    if (ref === "./articles/index.json" || ref.startsWith("./articles/page-")) {
      return Array.isArray(data.articles) ? data.articles : [];
    }
    if (ref === "./articles/news-categories.json") {
      return Array.isArray(data.articleCategories) ? data.articleCategories : [];
    }
  }
  return resolveProps(value, data);
}

export function resolveProps(props: Record<string, any>, data: Record<string, any>): Record<string, any> {
  if (!props) return {};
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    if (typeof value === "string" && value.includes("${")) {
      result[key] = resolveBinding(value, data);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => (typeof item === "object" && item !== null ? resolveProps(item, data) : item));
    } else if (typeof value === "object" && value !== null) {
      result[key] = resolveRef(value, data);
    } else {
      result[key] = value;
    }
  }

  return result;
}

// ================== 从 generator-cli/src/utils/layout-resolver.ts 复刻 ==================

export function applyLayout(page: any, layouts: Record<string, any>, siteConfig: any): any {
  if (!page.layout) {
    return page;
  }
  const layoutData = layouts[page.layout];
  if (!layoutData) {
    return page;
  }
  if (!layoutData.components) {
    return page;
  }

  const navStyle = page.meta?.navStyle || siteConfig.site?.navStyle || "light";
  const transparentTextColor = navStyle === "dark" ? "#374151" : "#ffffff";

  const layoutComponents = layoutData.components.map((comp: any) => {
    if (comp.name === "NavMenu") {
      const baseProps = comp.props || {
        logo: siteConfig.site?.ogImage,
        logoAlt: siteConfig.site?.name,
        contactText: "立即咨询",
        contactHref: "/consultation.html",
        transparentBgColor: "transparent",
        items: siteConfig.navigation || [],
      };
      return { ...comp, props: { ...baseProps, transparentTextColor } };
    }
    if (comp.name === "SiteFooter") {
      return { ...comp, props: comp.props || {} };
    }
    if (comp.name === "FloatingSidebar") {
      return { ...comp, props: comp.props || { items: [] } };
    }
    return comp;
  });

  const finalComponents: any[] = [];
  let slotFound = false;

  for (const comp of layoutComponents) {
    if (comp.name === "__slot__") {
      finalComponents.push(...page.components);
      slotFound = true;
    } else {
      finalComponents.push(comp);
    }
  }

  if (!slotFound) {
    finalComponents.push(...page.components);
  }

  return {
    ...page,
    components: finalComponents,
  };
}

// ================== 配置组装函数 ==================

function safeJsonParse(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

function parseTrackingScripts(value: string | undefined): string[] {
  if (!value) return [];
  const parsed = safeJsonParse(value);
  if (Array.isArray(parsed)) return parsed as string[];
  return [];
}

export function buildSiteConfig(setting: WebsiteSetting): Record<string, any> {
  return {
    site: {
      name: setting.siteName,
      url: setting.url,
      ogImage: setting.ogImage,
      favicon: setting.favicon,
      primaryColor: setting.primaryColor || "#1578FF",
      navStyle: setting.navStyle,
    },
    seo: {
      defaultTitle: setting.defaultTitle,
      defaultDescription: setting.defaultDescription,
      defaultKeywords: setting.defaultKeywords,
    },
    trackingScripts: parseTrackingScripts(setting.trackingScripts),
    navigation: [],
  };
}

export interface PreviewPage {
  path: string;
  name: string;
  meta?: Record<string, string>;
  components: { name: string; props: Record<string, any>; interactive?: boolean }[];
}

export function buildPageList(pages: SitePageVO[], layouts: Record<string, any>, siteConfig: Record<string, any>): PreviewPage[] {
  const result: PreviewPage[] = [];

  for (const page of pages) {
    const components = safeJsonParse(page.components || "[]") as any[];

    const meta: Record<string, string> = {};
    if (page.metaTitle) meta.title = page.metaTitle;
    if (page.metaDescription) meta.description = page.metaDescription;
    if (page.metaKeywords) meta.keywords = page.metaKeywords;
    if (page.metaNavStyle) meta.navStyle = page.metaNavStyle;

    let pageData: any = {
      path: page.pageRoute,
      layout: page.layout,
      meta,
      components: Array.isArray(components) ? components : [],
    };

    // 应用布局
    if (pageData.layout && layouts[pageData.layout]) {
      pageData = applyLayout(pageData, layouts, siteConfig);
    }

    // 文章列表页面：自动覆盖 CategoryTabs.categories 为业务数据（与 generator-service 行为一致）
    const hasNewsSection = pageData.components.some((comp: any) => comp.name === "NewsSection");
    if (hasNewsSection && Array.isArray(siteConfig.articleCategories)) {
      for (const comp of pageData.components) {
        if (comp.name === "CategoryTabs" && comp.props && typeof comp.props === "object") {
          comp.props.categories = siteConfig.articleCategories;
        }
      }
    }

    // 解析 props binding
    const resolvedComponents = pageData.components.map((comp: any) => ({
      ...comp,
      props: resolveProps(comp.props, siteConfig),
      interactive: comp.interactive || false,
    }));

    result.push({
      path: page.pageRoute,
      name: page.pageName,
      meta,
      components: resolvedComponents,
    });
  }

  return result;
}

export function buildLayoutMap(layouts: SiteLayoutVO[]): Record<string, any> {
  const map: Record<string, any> = {};
  for (const layout of layouts) {
    const config = safeJsonParse(layout.config);
    map[layout.layoutName] = config;
    map[layout.id] = config; // page.layout 存储的是 layoutId
  }
  return map;
}

export function buildArticleList(articles: Article[]): any[] {
  return articles.map((article) => {
    const createdTime = (article as any).createdTime || (article as any).createTime || "";
    const updatedTime = (article as any).updatedTime || (article as any).updateTime || "";
    return {
      id: String(article.id),
      title: article.title,
      date: createdTime,
      summary: article.summary ?? "",
      abstract: null,
      category: article.categoryName,
      href: `/information/detail-${article.id}.html`,
      image: article.coverImageUrl,
      author: article.author,
      content: article.content,
      click: article.viewCount ?? 0,
      create_time: createdTime,
      update_time: updatedTime,
    };
  });
}

export function buildArticleCategoryList(categoryTree: ArticleCategoryTree[]): any[] {
  if (!Array.isArray(categoryTree)) {
    return [];
  }
  return categoryTree.map((cat) => ({
    id: cat.pathId || String(cat.id),
    name: cat.categoryName,
    href: `/information/category/${cat.pathId || cat.id}.html#category-filter`,
  }));
}
