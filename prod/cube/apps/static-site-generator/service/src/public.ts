import { type CubeAuth, CubeGateway } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import type {
  Article,
  ArticleCategoryTree,
  BuildRecordVO,
  MaterialFolderVO,
  MaterialVO,
  SiteLayoutVO,
  SitePageVO,
  SitePublishConfigVO,
  UserFeedback,
  WebsiteSetting,
} from "./types";
const baseURL = `${BASE_API}/guhecloudWebsite`;

/** 将后端返回的 number ID 统一转为 string，避免精度丢失 */
function formatTime(timestamp: string | number | undefined): string {
  if (!timestamp) {
    return "--";
  }
  const num = Number(timestamp);
  if (isNaN(num) || num === 0) {
    return String(timestamp);
  }
  const date = new Date(num);
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function normalizeMaterialFolder(folder: MaterialFolderVO): MaterialFolderVO {
  return {
    ...folder,
    id: String(folder.id),
    pathId: folder.pathId ? String(folder.pathId) : null,
    createTime: formatTime(folder.createTime),
    updateTime: formatTime(folder.updateTime),
    children: folder.children?.map(normalizeMaterialFolder),
  };
}

function normalizeMaterial(material: MaterialVO): MaterialVO {
  return {
    ...material,
    id: String(material.id),
    pathId: material.pathId ? String(material.pathId) : null,
    createTime: formatTime(material.createTime),
    updateTime: formatTime(material.updateTime),
  };
}

function normalizeSiteLayout(layout: SiteLayoutVO): SiteLayoutVO {
  return {
    ...layout,
    id: String(layout.id),
    createdTime: formatTime(layout.createdTime),
    updatedTime: formatTime(layout.updatedTime),
  };
}

function normalizeUserFeedback(feedback: UserFeedback): UserFeedback {
  return {
    ...feedback,
    id: String(feedback.id),
    createTime: formatTime(feedback.createTime),
  };
}

function normalizeSitePage(page: any): SitePageVO {
  return {
    ...page,
    id: String(page.id),
    layoutId: String(page.layoutId),
    layout: String(page.layoutId),
    createdTime: formatTime(page.createTime),
    updatedTime: formatTime(page.updateTime),
    // oxlint-disable-next-line no-magic-numbers
    status: Number(page.status || 1),
  };
}

function normalizeArticlePage(page: any): Article {
  return {
    ...page,
    createdTime: formatTime(page.createTime),
    updatedTime: formatTime(page.updateTime),
  };
}

function normalizeBuildRecord(record: BuildRecordVO): BuildRecordVO {
  return {
    ...record,
    id: String(record.id),
    createTime: formatTime(record.createTime),
  };
}

/** 网站管理接口 */
export class CubeStaticSiteGeneratorPublicService {
  private readonly gateway: CubeGateway;
  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 获取文章分类树 */
  public async getArticleCategoryTree(): Promise<ArticleCategoryTree[]> {
    const url = `${baseURL}/website/article/category/tree`;
    return this.gateway.get<ArticleCategoryTree[]>({ url });
  }

  /** 新增文章分类 */
  public async addArticleCategory(payload: { categoryName: string; pathId: string | number; sort: number; status: number }): Promise<void> {
    const url = `${baseURL}/website/article/category`;
    return this.gateway.create({ url, payload });
  }

  /** 修改文章分类 */
  public async updateArticleCategory(payload: {
    id: string;
    categoryName: string;
    pathId: string | number;
    sort: number;
    status: number;
  }): Promise<void> {
    const url = `${baseURL}/website/article/category/${payload.id}`;
    return this.gateway.update({ url, payload });
  }

  /** 删除文章分类 */
  public async deleteArticleCategory(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/website/article/category/${payload.id}`;
    return this.gateway.delete({ url });
  }

  /** 启用/禁用文章分类 */
  public async updateArticleCategoryStatus(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/website/article/category/${payload.id}/status`;
    return this.gateway.update({ url });
  }

  /** 分页查询文章列表 */
  public async getArticleList(payload: {
    pageNumber: number;
    pageSize: number;
    categoryId?: string | undefined;
    status?: number | undefined;
    title?: string | undefined;
  }): Promise<{ records: Article[]; total: number; pages: number }> {
    const url = `${baseURL}/website/article/page`;

    const res = await this.gateway.get<{ records: Article[]; total: number; pages: number }>({ url, payload });
    return {
      records: res.records.map(normalizeArticlePage),
      total: res.total,
      pages: res.pages,
    };
  }

  /** 获取文章详情 */
  public async getArticleDetail(payload: { id: string }): Promise<Article> {
    const url = `${baseURL}/website/article/${payload.id}`;
    return this.gateway.get<Article>({ url });
  }

  /** 新增文章 */
  public async addArticle(payload: {
    title: string;
    categoryId: string;
    coverImageUrl?: string;
    summary?: string;
    content: string;
    author?: string;
    status: number;
  }): Promise<void> {
    const url = `${baseURL}/website/article`;
    return this.gateway.create({ url, payload });
  }

  /** 编辑文章 */
  public async updateArticle(payload: {
    id: string;
    title: string;
    categoryId: string;
    coverImageUrl?: string;
    summary?: string;
    content: string;
    author?: string;
    status: number;
  }): Promise<void> {
    const url = `${baseURL}/website/article/${payload.id}`;
    return this.gateway.update({ url, payload });
  }

  /** 删除文章 */
  public async deleteArticle(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/website/article/${payload.id}`;
    return this.gateway.delete({ url });
  }

  /** 启用/禁用文章 */
  public async updateArticleStatus(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/website/article/${payload.id}/status`;
    return this.gateway.update({ url });
  }

  /** 获取网站设置详情 */
  public async getWebsiteSetting(): Promise<WebsiteSetting> {
    const url = `${baseURL}/website/setting/detail`;
    return this.gateway.get<WebsiteSetting>({ url });
  }

  /** 更新网站设置 */
  public async updateWebsiteSetting(payload: {
    siteLogo?: string;
    siteName: string;
    url: string;
    copyright?: string;
    icpInfo?: string;
    contactPhone?: string;
    contactEmail?: string;
    officialAccount?: string;
    videoAccount?: string;
    douyin?: string;
    toutiao?: string;
    zhihu?: string;
    xiaohongshu?: string;
    statisticsCode?: string;
    ogImage?: string;
    favicon?: string;
    primaryColor?: string;
    defaultTitle?: string;
    defaultDescription?: string;
    defaultKeywords?: string;
    trackingScripts?: string;
  }): Promise<void> {
    const url = `${baseURL}/website/setting`;
    return this.gateway.update({ url, payload });
  }

  /** 分页查询用户留言 */
  public async getFeedbackList(payload: {
    pageNumber: number;
    pageSize: number;
    userName?: string;
    contactWay?: string;
    companyName?: string;
  }): Promise<{ records: UserFeedback[]; total: number; pages: number }> {
    const url = `${baseURL}/website/feedback/page`;
    const res = await this.gateway.get<{ records: UserFeedback[]; total: number; pages: number }>({ url, payload });
    return { ...res, records: res.records.map(normalizeUserFeedback) };
  }

  /** 获取用户留言详情 */
  public async getFeedbackDetail(payload: { id: string }): Promise<UserFeedback> {
    const url = `${baseURL}/website/feedback/${payload.id}`;
    const res = await this.gateway.get<UserFeedback>({ url });
    return normalizeUserFeedback(res);
  }

  /** 新增用户留言 */
  public async addFeedback(payload: {
    userName: string;
    contactWay: string;
    companyName?: string;
    applicationScenario?: string;
  }): Promise<void> {
    const url = `${baseURL}/website/feedback`;
    return this.gateway.create({ url, payload });
  }

  /** 删除用户留言 */
  public async deleteFeedback(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/website/feedback/${payload.id}`;
    return this.gateway.delete({ url });
  }

  // ==================== 素材文件夹 ====================

  /** 查询文件夹列表 */
  public async getMaterialFolderList(pathId: string | null): Promise<MaterialFolderVO[]> {
    const url = `${baseURL}/website/material-folder/list`;
    const payload: Record<string, unknown> = { pathId: 0 };
    if (pathId && pathId !== "root") {
      payload.pathId = pathId;
    }
    const res = await this.gateway.get<MaterialFolderVO[]>({ url, payload });
    return res.map(normalizeMaterialFolder);
  }

  /** 新增文件夹 */
  public async addMaterialFolder(payload: { pathId: string | null; name: string; sort: number }): Promise<void> {
    const url = `${baseURL}/website/material-folder`;
    const body: Record<string, unknown> = { name: payload.name, sort: payload.sort, pathId: 0 };
    if (payload.pathId && payload.pathId !== "root") {
      body.pathId = payload.pathId;
    }
    return this.gateway.create({ url, payload: body });
  }

  /** 重命名文件夹 */
  public async renameMaterialFolder(payload: { id: string; name: string; sort: number; pathId: string | null }): Promise<void> {
    const url = `${baseURL}/website/material-folder/${payload.id}`;
    const body: Record<string, unknown> = { id: payload.id, name: payload.name, sort: payload.sort, pathId: 0 };
    if (payload.pathId && payload.pathId !== "root") {
      body.pathId = payload.pathId;
    }
    return this.gateway.update({ url, payload: body });
  }

  /** 删除文件夹 */
  public async deleteMaterialFolder(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/website/material-folder/${payload.id}`;
    return this.gateway.delete({ url });
  }

  // ==================== 素材 ====================

  /** 查询素材列表 */
  public async getMaterialList(payload: { pathId?: string | null }): Promise<MaterialVO[]> {
    const url = `${baseURL}/website/material/list`;
    const params: Record<string, unknown> = { pathId: 0 };
    if (payload.pathId && payload.pathId !== "root") {
      params.pathId = payload.pathId;
    }
    const res = await this.gateway.get<MaterialVO[]>({ url, payload: params });
    return res.map(normalizeMaterial);
  }

  /** 分页查询素材 */
  public async getMaterialPage(payload: {
    pageNumber: number;
    pageSize: number;
    pathId?: string | null;
  }): Promise<{ records: MaterialVO[]; total: number; pages: number }> {
    const url = `${baseURL}/website/material/page`;
    const params: Record<string, unknown> = { pageNumber: payload.pageNumber, pageSize: payload.pageSize, pathId: 0 };
    if (payload.pathId && payload.pathId !== "root") {
      params.pathId = payload.pathId;
    }
    const res = await this.gateway.get<{ records: MaterialVO[]; total: number; pages: number }>({ url, payload: params });
    return { ...res, records: res.records.map(normalizeMaterial) };
  }

  /** 获取素材详情 */
  public async getMaterialDetail(payload: { id: string }): Promise<MaterialVO> {
    const url = `${baseURL}/website/material/${payload.id}`;
    const res = await this.gateway.get<MaterialVO>({ url });
    return normalizeMaterial(res);
  }

  /** 新增素材 */
  public async addMaterial(payload: { pathId: string | null; fileId: string }): Promise<void> {
    const url = `${baseURL}/website/material`;
    const body: Record<string, unknown> = { fileId: payload.fileId, pathId: 0 };
    if (payload.pathId && payload.pathId !== "root") {
      body.pathId = payload.pathId;
    }
    return this.gateway.create({ url, payload: [body] });
  }

  /** 删除素材 */
  public async deleteMaterial(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/website/material/${payload.id}`;
    return this.gateway.delete({ url });
  }

  /** 重命名素材 */
  public async renameMaterial(payload: { id: string; name: string }): Promise<void> {
    const url = `${baseURL}/website/material/${payload.id}/rename`;
    return this.gateway.update({ url, payload: { id: payload.id, name: payload.name } });
  }

  // ==================== 布局 ====================

  /** 获取布局列表 */
  public async getLayoutList(): Promise<SiteLayoutVO[]> {
    const url = `${baseURL}/website/layout/list`;
    const res = await this.gateway.get<SiteLayoutVO[]>({ url });
    return res.map(normalizeSiteLayout);
  }

  /** 获取布局详情 */
  public async getLayoutDetail(payload: { id: string }): Promise<SiteLayoutVO> {
    const url = `${baseURL}/website/layout/${payload.id}`;
    const res = await this.gateway.get<SiteLayoutVO>({ url });
    return normalizeSiteLayout(res);
  }

  /** 新增布局 */
  public async addLayout(payload: { layoutName: string; config: string }): Promise<void> {
    const url = `${baseURL}/website/layout`;
    return this.gateway.create({ url, payload });
  }

  /** 编辑布局 */
  public async updateLayout(payload: { layoutName: string; config: string }): Promise<void> {
    const url = `${baseURL}/website/layout`;
    return this.gateway.update({ url, payload });
  }

  /** 删除布局 */
  public async deleteLayout(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/website/layout/${payload.id}`;
    return this.gateway.delete({ url });
  }

  // ==================== 页面 ====================

  /** 获取页面列表 */
  public async getPageList(payload?: { metaTitle?: string }): Promise<SitePageVO[]> {
    const url = `${baseURL}/website/page/list`;
    const res = await this.gateway.get<SitePageVO[]>({ url, payload });
    return res.map(normalizeSitePage);
  }

  /** 获取页面详情 */
  public async getPageDetail(payload: { id: string }): Promise<SitePageVO> {
    const url = `${baseURL}/website/page/${payload.id}`;
    const res = await this.gateway.get<SitePageVO>({ url });
    return normalizeSitePage(res);
  }

  /** 新增页面 */
  public async addPage(payload: {
    pageName: string;
    pageRoute: string;
    layoutId: string;
    metaNavStyle?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    components?: string;
    status?: number;
  }): Promise<void> {
    const url = `${baseURL}/website/page`;
    return this.gateway.create({ url, payload });
  }

  /** 编辑页面 */
  public async updatePage(payload: {
    id: string;
    pageName: string;
    pageRoute: string;
    layoutId: string;
    metaNavStyle?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    components?: string;
    status?: number;
  }): Promise<void> {
    const url = `${baseURL}/website/page/${payload.id}`;
    return this.gateway.update({ url, payload });
  }

  /** 删除页面 */
  public async deletePage(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/website/page/${payload.id}`;
    return this.gateway.delete({ url });
  }

  // ==================== 网站发布配置 ====================

  /** 查询发布配置详情 */
  public async getPublishConfig(): Promise<SitePublishConfigVO> {
    const url = `${baseURL}/website/publish-config`;
    return this.gateway.get<SitePublishConfigVO>({ url });
  }

  /** 保存或更新发布配置 */
  public async savePublishConfig(payload: {
    provider: string;
    providerConfig: string;
    downloadStatic?: boolean;
    excludeHosts?: string;
  }): Promise<void> {
    const url = `${baseURL}/website/publish-config`;
    return this.gateway.update({ url, payload });
  }

  // ==================== 构建发布制品 ====================

  /** 生成制品 */
  public async runBuild(payload?: { downloadStatic?: boolean; excludeHosts?: string }): Promise<void> {
    const url = `${baseURL}/website/release/build`;
    return this.gateway.create({ url, payload });
  }

  /** 发布制品 */
  public async publishArtifact(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/website/release/${payload.id}/publish`;
    return this.gateway.create({ url });
  }

  /** 删除制品 */
  public async deleteArtifact(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/website/release/${payload.id}`;
    return this.gateway.delete({ url });
  }

  /** 分页查询构建记录 */
  public async getBuildRecordPage(payload: {
    pageNumber: number;
    pageSize: number;
    status?: string | undefined;
    artifactName?: string | undefined;
    releaseStatus?: string | undefined;
  }): Promise<{ records: BuildRecordVO[]; total: number; pages: number }> {
    const url = `${baseURL}/website/release/page`;
    const res = await this.gateway.get<{ records: BuildRecordVO[]; total: number; pages: number }>({ url, payload });
    return { ...res, records: res.records.map(normalizeBuildRecord) };
  }
}
