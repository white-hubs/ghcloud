/** 文章分类树节点 */
export interface ArticleCategoryTree {
  id: string;
  categoryName: string;
  pathId: string;
  sort: number;
  status: string;
  articleCount: number;
  children?: ArticleCategoryTree[];
}

/** 文章 */
export interface Article {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  coverImageUrl: string;
  summary: string;
  content: string;
  author: string;
  status: number;
  viewCount: number;
}

/** 网站设置 */
export interface WebsiteSetting {
  id: string;
  siteLogo: string;
  siteName: string;
  url: string;
  zhihu: string;
  ogImage: string;
  favicon: string;
  primaryColor: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  trackingScripts: string;
  navStyle: string;
}

/** 素材文件夹 */
export interface MaterialFolderVO {
  id: string;
  pathId: string | null;
  name: string;
  sort: number;
  createTime: string;
  updateTime: string;
  children?: MaterialFolderVO[];
}

/** 素材 */
export interface MaterialVO {
  id: string;
  pathId: string | null;
  name: string;
  ext: string;
  mimeType: string;
  size: number;
  url: string;
  createTime: string;
  updateTime: string;
}

/** 布局 */
export interface SiteLayoutVO {
  id: string;
  layoutName: string;
  config: string;
  createdTime: string;
  updatedTime: string;
}

/** 页面 */
export interface SitePageVO {
  id: string;
  pageName: string;
  pageTitle: string;
  pageRoute: string;
  layoutId: string;
  layout: string;
  metaNavStyle: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdTime: string;
  updatedTime: string;
  createBy?: string;
  updateBy?: string;
  components?: string;
  status: number;
}

/** 网站发布配置 */
export interface SitePublishConfigVO {
  id: string;
  provider: string;
  providerConfig: string;
  downloadStatic?: boolean;
  excludeHosts?: string;
  createdTime: string;
  updatedTime: string;
}

/** 构建记录 */
export interface BuildRecordVO {
  id: string;
  artifactName: string;
  artifactUrl: string;
  status: string;
  durationMs: number;
  errorMessage: string;
  deployStatus: string;
  createBy: string;
  createTime: string;
}

/** 用户留言 */
export interface UserFeedback {
  id: string;
  userName: string;
  contactWay: string;
  companyName: string;
  applicationScenario: string;
  createTime: string;
}
