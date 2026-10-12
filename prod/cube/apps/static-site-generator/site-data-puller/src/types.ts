export interface WebsiteSettingApi {
  id: string | number;
  siteLogo?: string;
  siteName: string;
  url: string;
  zhihu?: string;
  ogImage: string;
  favicon: string;
  primaryColor: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  trackingScripts: string;
  navStyle: string;
}

export interface SiteLayoutApi {
  id: string | number;
  layoutName: string;
  config: string;
  createdTime?: string | number;
  updatedTime?: string | number;
}

export interface SitePageApi {
  id: string | number;
  pageName: string;
  pageTitle?: string;
  pageRoute: string;
  layoutId: string | number;
  layout: string | number;
  metaNavStyle: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdTime?: string | number;
  updatedTime?: string | number;
  components?: string;
  status?: number;
}

export interface ArticleCategoryApi {
  id: string | number;
  categoryName: string;
  pathId: string | number;
  sort: number;
  status: string | number;
  articleCount?: number;
  children?: ArticleCategoryApi[];
}

export interface ArticleApi {
  id: string | number;
  title: string;
  categoryId: string | number;
  categoryName: string;
  coverImageUrl: string;
  summary: string;
  content: string;
  author: string;
  status?: number;
  viewCount: number;
  createTime?: string | number;
  updateTime?: string | number;
}

export interface ArticlePageResponse {
  records: ArticleApi[];
  total: number;
  pages: number;
}

// Local output types
export interface SiteSetting {
  siteName: string;
  url: string;
  ogImage: string;
  favicon: string;
  primaryColor: string;
  navStyle: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  trackingScripts: string;
}

export interface SiteLayout {
  id: string | number;
  layoutName: string;
  config: string;
}

export interface SitePage {
  id: string | number;
  pageRoute: string;
  layout: string | number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  metaNavStyle: string;
  components: string;
}

export interface ArticleCategory {
  id: string | number;
  categoryName: string;
  sort: number;
}

export interface Article {
  id: string | number;
  title: string;
  date: string;
  createTime: string;
  updateTime: string;
  summary: string;
  content: string;
  coverImageUrl: string;
  author: string;
  viewCount: number;
  category: string;
  categoryId: string | number;
  href: string;
}

export interface PullConfig {
  baseUrl: string;
  token: string;
  tenant: string;
  terminal: string;
  outputDir: string;
  siteDirName: string;
  pageSize: number;
  rateLimitMs: number;
  dryRun: boolean;
}
