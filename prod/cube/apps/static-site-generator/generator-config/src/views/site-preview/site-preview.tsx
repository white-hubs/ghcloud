// oxlint-disable no-console
// oxlint-disable typescript/no-explicit-any
import { defineComponent, onMounted, reactive, ref, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { Article, ArticleCategoryTree } from "@ghcloud/cube-static-site-generator-service";
import { Spin, message } from "@ghcloud/cube-ui";

import { PageRenderer } from "./page-renderer";
import {
  buildArticleList,
  buildArticleCategoryList,
  buildLayoutMap,
  buildPageList,
  buildSiteConfig,
  resolveProps,
  type PreviewPage,
} from "./preview-utils";
import { cubeSiteGeneratorService } from "@/api/service";

async function loadAllArticles(): Promise<Article[]> {
  const allArticles: Article[] = [];
  let pageNumber = 1;
  const pageSize = 200;

  while (true) {
    const result = await cubeSiteGeneratorService.getArticleList({
      pageNumber,
      pageSize,
    });
    allArticles.push(...result.records);
    if (result.records.length < pageSize || pageNumber >= result.pages) {
      break;
    }
    pageNumber++;
  }

  return allArticles;
}

function resolvePageRouteFromUrl(pathParam: string | string[]): string {
  if (!pathParam) return "/";
  const raw = Array.isArray(pathParam) ? pathParam.join("/") : pathParam;
  return raw.startsWith("/") ? raw : "/" + raw;
}

export const SitePreview = defineComponent({
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(false);
    const refreshKey = ref(0);
    const state = reactive<{
      siteConfig: Record<string, any>;
      pages: PreviewPage[];
    }>({
      siteConfig: {},
      pages: [],
    });

    const getPageRoute = (): string => {
      return resolvePageRouteFromUrl(route.params.path as string | string[]);
    };

    const currentPage = (): PreviewPage | undefined => {
      const pageRoute = getPageRoute();

      // 1. 精确匹配
      let matchedPage = state.pages.find((p) => {
        if (p.path === pageRoute) return true;
        // 兼容末尾斜杠差异
        if (p.path + "/" === pageRoute) return true;
        if (p.path === pageRoute + "/") return true;
        return false;
      });

      // 2. basename 模糊匹配（处理路径前缀不一致的情况）
      if (!matchedPage) {
        const basename = pageRoute.split("/").pop();
        if (basename) {
          matchedPage = state.pages.find((p) => p.path.endsWith(basename));
        }
      }

      if (!matchedPage) return undefined;

      // 预览环境：如果有 category 查询参数，模拟 SSG 分类分页行为
      const categoryId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("category") || "" : "";
      if (!categoryId) return matchedPage;

      const categoryName = state.siteConfig.articleCategories?.find((c: any) => c.id === categoryId)?.name || "";

      return {
        ...matchedPage,
        components: matchedPage.components.map((comp: any) => {
          if (comp.name === "NewsSection" && Array.isArray(comp.props?.news)) {
            return {
              ...comp,
              props: {
                ...comp.props,
                news: categoryName ? comp.props.news.filter((item: any) => item.category === categoryName) : comp.props.news,
                enableCategoryFilter: false,
              },
            };
          }
          if (comp.name === "CategoryTabs") {
            return {
              ...comp,
              props: {
                ...comp.props,
                activeId: categoryId || comp.props?.activeId,
              },
            };
          }
          return comp;
        }),
      };
    };

    // 拦截站内链接跳转，将绝对路径转换为 /site-preview 前缀
    const handleLinkClick = (e: MouseEvent): void => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // 外部链接、锚点、javascript 不处理
      if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
        return;
      }

      // 纯锚点（如 #news-list）— 滚动到对应元素
      if (href.startsWith("#")) {
        // 空锚点 # 不做任何处理，避免滚动到顶部
        if (href === "#") {
          e.preventDefault();
          return;
        }
        const id = href.slice(1);
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth" });
        }
        return;
      }

      // 分类分页链接 /xxx/category/yyy.html → /xxx.html?category=分类ID（预览环境无独立分类分页）
      const categoryPageMatch = href.match(/^(\/[^/]+)\/category\/([^/]+)\.html/);
      if (categoryPageMatch) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        const parentPath = `${categoryPageMatch[1]}.html`;
        const categoryId = categoryPageMatch[2];
        const hash = href.includes("#") ? href.slice(href.indexOf("#")) : "";
        router.push(`/site-preview${parentPath}?category=${categoryId}${hash}`);
        return;
      }

      // 站内绝对路径 /xxx → /site-preview/xxx
      if (href.startsWith("/")) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        const previewPath = `/site-preview${href === "/" ? "" : href}`;
        router.push(previewPath);
        return;
      }
    };

    // 动态注入站点样式
    const injectSiteStyles = (siteConfig: Record<string, any>) => {
      const primaryColor = siteConfig.site?.primaryColor || "#1578FF";

      // 移除旧样式
      const oldStyle = document.getElementById("site-preview-style");
      if (oldStyle) oldStyle.remove();

      const style = document.createElement("style");
      style.id = "site-preview-style";
      style.textContent = `
        :root { --primary: ${primaryColor}; }
        html { overflow-x: hidden; }
        body { margin: 0; padding: 0; width: 100vw; overflow-x: hidden; }
      `;
      document.head.appendChild(style);

      // 字体缩放脚本
      const oldScript = document.getElementById("site-preview-font-script");
      if (oldScript) oldScript.remove();

      const script = document.createElement("script");
      script.id = "site-preview-font-script";
      script.textContent = `
        (function() {
          const html = document.documentElement;
          function update() {
            const width = window.innerWidth;
            const size = Math.round(Math.max((width / 1920) * 16, 12) * 100) / 100;
            if (html.getAttribute('data-fontsize') != size) {
              html.style.fontSize = size + 'px';
              html.setAttribute('data-fontsize', size);
            }
          }
          update();
          window.addEventListener('resize', update);
        })();
      `;
      document.head.appendChild(script);

      // 更新标题
      const page = currentPage();
      const siteName = siteConfig.site?.name || "";
      const pageTitle = page?.meta?.title || siteConfig.seo?.defaultTitle || siteName;
      document.title = pageTitle && siteName && !pageTitle.includes(siteName) ? `${pageTitle} - ${siteName}` : pageTitle;
    };

    const loadData = async (): Promise<void> => {
      loading.value = true;
      try {
        const [setting, layouts, pageList, articles, categoryTree] = await Promise.all([
          cubeSiteGeneratorService.getWebsiteSetting(),
          cubeSiteGeneratorService.getLayoutList(),
          cubeSiteGeneratorService.getPageList(),
          loadAllArticles(),
          cubeSiteGeneratorService.getArticleCategoryTree(),
        ]);

        const siteConfig = buildSiteConfig(setting);
        siteConfig.articles = buildArticleList(articles);
        siteConfig.articleCategories = buildArticleCategoryList(categoryTree);

        // eslint-disable-next-line no-console
        console.log("[site-preview] articles count:", articles.length, "built articles:", siteConfig.articles.length);

        const layoutMap = buildLayoutMap(layouts);

        // 列表接口可能不返回 components 字段，需要逐个获取页面详情
        const pages = await Promise.all(pageList.map((p) => cubeSiteGeneratorService.getPageDetail({ id: p.id })));

        const previewPages = buildPageList(pages, layoutMap, siteConfig);

        // 从预览页面中移除动态路由模板（如 /information/detail-{id}.html），避免直接匹配到模板
        const filteredPages = previewPages.filter((p) => !p.path.includes("{id}"));

        // 自动生成文章详情页（与 generator-cli 的 getStaticPaths 行为一致）
        const articleDetailTemplateRaw = pages.find((p: any) => p.pageRoute?.includes("{id}"));
        if (articleDetailTemplateRaw) {
          const templateComponents = JSON.parse(articleDetailTemplateRaw.components || "[]") as any[];

          for (const article of articles) {
            const detailPath = `/information/detail-${article.id}.html`;
            const articleData = buildArticleList([article])[0];
            const bindingContext = { ...siteConfig, ...articleData };

            filteredPages.push({
              path: detailPath,
              name: articleDetailTemplateRaw.pageName || "资讯详情",
              meta: {
                title: article.title || "资讯详情",
              },
              components: templateComponents.map((comp: any) => ({
                ...comp,
                props: resolveProps(comp.props, bindingContext),
                interactive: comp.interactive || false,
              })),
            });
          }
        }

        state.siteConfig = siteConfig;
        state.pages = filteredPages;

        // eslint-disable-next-line no-console
        console.log(
          "[site-preview] built preview pages:",
          previewPages.map((p) => ({
            path: p.path,
            name: p.name,
            componentCount: p.components.length,
            componentNames: p.components.map((c) => c.name),
          })),
        );
        // eslint-disable-next-line no-console
        console.log(
          "[site-preview] current route:",
          getPageRoute(),
          "matched page:",
          previewPages.find((p) => p.path === getPageRoute())?.name,
        );

        nextTick(() => {
          injectSiteStyles(siteConfig);
        });
      } catch (error) {
        message.error("加载预览数据失败");
        console.error("加载预览数据失败:", error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadData();
    });

    watch(
      () => route.fullPath,
      () => {
        injectSiteStyles(state.siteConfig);
        refreshKey.value++;
      },
    );

    return (): JSX.Element => {
      const page = currentPage();

      return (
        <div style={{ minHeight: "100vh", background: "#fff" }} onClick={handleLinkClick}>
          {loading.value ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
              <Spin tip="加载预览中..." />
            </div>
          ) : page ? (
            <PageRenderer key={refreshKey.value} page={page} />
          ) : state.pages.length > 0 ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#999" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>404</div>
                <div>未找到页面：{getPageRoute()}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#999" }}>
              暂无页面数据
            </div>
          )}
        </div>
      );
    };
  },
});
