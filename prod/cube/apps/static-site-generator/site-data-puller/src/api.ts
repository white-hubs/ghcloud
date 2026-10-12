import { ApiClient } from "./client.ts";
import type { ArticleApi, ArticleCategoryApi, ArticlePageResponse, SiteLayoutApi, SitePageApi, WebsiteSettingApi } from "./types.ts";

export class SiteDataApi {
  private readonly client: ApiClient;

  public constructor(client: ApiClient) {
    this.client = client;
  }

  public async fetchSetting(): Promise<WebsiteSettingApi> {
    return this.client.request<WebsiteSettingApi>({
      path: "/website/setting/detail",
    });
  }

  public async fetchLayouts(): Promise<SiteLayoutApi[]> {
    return this.client.request<SiteLayoutApi[]>({
      path: "/website/layout/list",
    });
  }

  public async fetchLayoutDetail(id: string | number): Promise<SiteLayoutApi> {
    return this.client.request<SiteLayoutApi>({
      path: `/website/layout/${id}`,
    });
  }

  public async fetchAllLayoutDetails(layouts: SiteLayoutApi[], rateLimitMs: number): Promise<SiteLayoutApi[]> {
    const results: SiteLayoutApi[] = [];
    for (const layout of layouts) {
      try {
        const detail = await this.fetchLayoutDetail(layout.id);
        const merged: SiteLayoutApi = { ...layout };
        for (const key of Object.keys(detail) as Array<keyof SiteLayoutApi>) {
          const value = detail[key];
          if (value !== undefined && value !== null) {
            (merged as any)[key] = value;
          }
        }
        results.push(merged);
      } catch (err) {
        console.warn(`[api] 布局详情获取失败，使用列表数据: ${layout.layoutName} (id=${layout.id})`);
        results.push(layout);
      }
      if (rateLimitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, rateLimitMs));
      }
    }
    return results;
  }

  public async fetchPages(): Promise<SitePageApi[]> {
    return this.client.request<SitePageApi[]>({
      path: "/website/page/list",
    });
  }

  public async fetchPageDetail(id: string | number): Promise<SitePageApi> {
    return this.client.request<SitePageApi>({
      path: `/website/page/${id}`,
    });
  }

  public async fetchAllPageDetails(pages: SitePageApi[], rateLimitMs: number): Promise<SitePageApi[]> {
    const results: SitePageApi[] = [];
    for (const page of pages) {
      try {
        const detail = await this.fetchPageDetail(page.id);
        // 详情接口可能不返回 layout / layoutId，避免用 undefined 覆盖列表中的值
        const merged: SitePageApi = { ...page };
        for (const key of Object.keys(detail) as Array<keyof SitePageApi>) {
          const value = detail[key];
          if (value !== undefined && value !== null) {
            (merged as any)[key] = value;
          }
        }
        results.push(merged);
      } catch (err) {
        console.warn(`[api] 页面详情获取失败，使用列表数据: ${page.pageRoute} (id=${page.id})`);
        results.push(page);
      }
      if (rateLimitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, rateLimitMs));
      }
    }
    return results;
  }

  public async fetchCategoryTree(): Promise<ArticleCategoryApi[]> {
    return this.client.request<ArticleCategoryApi[]>({
      path: "/website/article/category/tree",
    });
  }

  public async fetchAllArticles(pageSize: number, rateLimitMs: number): Promise<ArticleApi[]> {
    const articles: ArticleApi[] = [];
    let pageNumber = 1;
    let total = 0;

    while (true) {
      const res = await this.client.request<ArticlePageResponse>({
        path: "/website/article/page",
        params: { pageNumber, pageSize },
      });

      if (!res || !Array.isArray(res.records)) {
        throw new Error("[api] 文章分页接口返回格式异常");
      }

      articles.push(...res.records);
      total = res.total ?? articles.length;

      if (res.records.length < pageSize || articles.length >= total) {
        break;
      }

      pageNumber += 1;
      if (rateLimitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, rateLimitMs));
      }
    }

    // 按 id 去重，避免同一篇文章在不同分页中重复出现导致 Astro resolveRefs 误判为循环引用
    const seen = new Set<string | number>();
    const unique: ArticleApi[] = [];
    for (const article of articles) {
      if (!seen.has(article.id)) {
        seen.add(article.id);
        unique.push(article);
      }
    }

    return unique;
  }
}
