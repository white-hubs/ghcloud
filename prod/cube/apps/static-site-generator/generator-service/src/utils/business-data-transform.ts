// oxlint-disable max-lines-per-function
// oxlint-disable no-magic-numbers
// oxlint-disable no-console
import { mkdir, writeFile, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

interface SiteSetting {
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

interface SiteLayout {
  id: number | string;
  layoutName: string;
  config: string;
}

interface SitePage {
  id: number | string;
  pageRoute: string;
  layout: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  metaNavStyle: string;
  components: string;
}

interface Article {
  id: number | string;
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
  categoryId?: number | string;
  href: string;
}

interface ArticleCategory {
  id?: number | string;
  categoryId?: number | string;
  name?: string;
  categoryName?: string;
  slug?: string;
}

async function findFiles(dir: string, filename: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await findFiles(fullPath, filename);
      results.push(...nested);
    } else if (entry.name === filename) {
      results.push(fullPath);
    }
  }
  return results;
}

function safeJsonParse(text: string): unknown {
  // 将 JSON 中 id / categoryId 字段的超大整数替换为字符串，避免 JS Number 精度丢失
  const safeText = text.replace(/"id"\s*:\s*(\d{16,})/g, '"id":"$1"').replace(/"categoryId"\s*:\s*(\d{16,})/g, '"categoryId":"$1"');
  return JSON.parse(safeText);
}

async function readJsonFile<T>(dir: string, filename: string, bigIntSafe = false): Promise<T> {
  const files = await findFiles(dir, filename);
  if (files.length === 0) {
    throw new Error(`Missing required file: ${filename}`);
  }
  const content = await readFile(files[0], "utf-8");
  if (bigIntSafe) {
    return safeJsonParse(content) as T;
  }
  return JSON.parse(content) as T;
}

function parseJsonString(value: unknown): unknown {
  if (typeof value === "string") {
    return JSON.parse(value);
  }
  return value;
}

function pageRouteToFilePath(pageRoute: string): string {
  let route = pageRoute;
  if (route.startsWith("/")) {
    route = route.slice(1);
  }
  if (route.endsWith(".html")) {
    route = route.slice(0, -5);
  }
  if (route === "") {
    route = "index";
  }
  return `pages/${route}.json`;
}

function pageRouteToRefPath(pageRoute: string): string {
  return `./${pageRouteToFilePath(pageRoute)}`;
}

export async function transformBusinessData(sourceDir: string, outputDir: string, tenantCode: string): Promise<void> {
  console.log(`[business-data] transform start (tenant=${tenantCode})`);
  // 1. 读取 5 个 JSON 文件
  const siteSetting = await readJsonFile<SiteSetting>(sourceDir, "site-setting.json");
  const siteLayouts = await readJsonFile<SiteLayout[]>(sourceDir, "site-layouts.json");
  const sitePages = await readJsonFile<SitePage[]>(sourceDir, "site-pages.json");
  const articles = await readJsonFile<Article[]>(sourceDir, "articles.json", true);

  // 读取 article-categories.json
  const categoryFiles = await findFiles(sourceDir, "article-categories.json");
  if (categoryFiles.length === 0) {
    throw new Error("Missing required file: article-categories.json");
  }
  const articleCategories = await readJsonFile<ArticleCategory[]>(sourceDir, "article-categories.json", true);
  const newsCategories = articleCategories.map((cat) => {
    const id = String(cat.id ?? cat.categoryId ?? "");
    const name = cat.name ?? cat.categoryName ?? "";
    return {
      id,
      name,
      href: `/information/category/${cat.slug ?? id}.html#category-filter`,
    };
  });

  console.log(
    `[business-data] loaded: layouts=${siteLayouts.length}, pages=${sitePages.length}, articles=${articles.length}, categories=${articleCategories.length}`,
  );

  // 2. 生成 site.config.json
  const siteConfig = {
    site: {
      name: siteSetting.siteName,
      url: siteSetting.url,
      ogImage: siteSetting.ogImage,
      favicon: siteSetting.favicon,
      primaryColor: siteSetting.primaryColor,
      navStyle: siteSetting.navStyle,
    },
    seo: {
      defaultTitle: siteSetting.defaultTitle,
      defaultDescription: siteSetting.defaultDescription,
      defaultKeywords: siteSetting.defaultKeywords,
    },
    trackingScripts: parseJsonString(siteSetting.trackingScripts) as string[],
  };

  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, "site.config.json"), JSON.stringify(siteConfig, null, 2));
  console.log("[business-data] wrote site.config.json");

  // 3. 生成 layouts
  const layoutsMap: Record<string, string> = {};
  for (const layout of siteLayouts) {
    const layoutDir = join(outputDir, "layouts");
    await mkdir(layoutDir, { recursive: true });
    const config = parseJsonString(layout.config);
    const layoutFile = join(layoutDir, `${layout.layoutName}.json`);
    await writeFile(layoutFile, JSON.stringify(config, null, 2));
    layoutsMap[layout.layoutName] = `./layouts/${layout.layoutName}.json`;
  }
  console.log(`[business-data] wrote ${siteLayouts.length} layout(s)`);

  // 4. 生成 pages
  const pageRefs: { $ref: string }[] = [];
  let articleDetailTemplateRef: { $ref: string } | undefined;

  for (const page of sitePages) {
    const pageDir = join(outputDir, "pages");
    await mkdir(pageDir, { recursive: true });

    const filePath = pageRouteToFilePath(page.pageRoute);
    const subDir = filePath.slice("pages/".length, -".json".length);
    if (subDir.includes("/")) {
      const nestedDir = join(pageDir, subDir.split("/").slice(0, -1).join("/"));
      await mkdir(nestedDir, { recursive: true });
    }

    const meta: Record<string, string> = {};
    if (page.metaTitle) {
      meta.title = page.metaTitle;
    }
    if (page.metaDescription) {
      meta.description = page.metaDescription;
    }
    if (page.metaKeywords) {
      meta.keywords = page.metaKeywords;
    }
    if (page.metaNavStyle) {
      meta.navStyle = page.metaNavStyle;
    }

    const components = parseJsonString(page.components) as Array<Record<string, unknown>>;

    // 文章列表页面：将 CategoryTabs.categories 替换为 $ref 引用
    const hasNewsSection = components.some((comp) => comp.name === "NewsSection");
    if (hasNewsSection) {
      for (const comp of components) {
        if (comp.name === "CategoryTabs" && comp.props && typeof comp.props === "object") {
          const props = comp.props as Record<string, unknown>;
          props.categories = { $ref: "./articles/news-categories.json" };
        }
      }
    }

    const pageData: Record<string, unknown> = {
      path: page.pageRoute,
      layout: page.layout,
      components,
    };
    if (Object.keys(meta).length > 0) {
      pageData.meta = meta;
    }

    const outputPath = join(outputDir, filePath);
    await writeFile(outputPath, JSON.stringify(pageData, null, 2));
    console.log(`[business-data] page ${page.pageRoute} -> ${filePath} (components=${components.length})`);

    const refPath = pageRouteToRefPath(page.pageRoute);
    pageRefs.push({ $ref: refPath });

    if (page.pageRoute.includes("{id}")) {
      articleDetailTemplateRef = { $ref: refPath };
    }
  }

  // 5. 生成 articles
  const articlesDir = join(outputDir, "articles");
  await mkdir(articlesDir, { recursive: true });

  // 写入 news-categories.json
  await writeFile(join(articlesDir, "news-categories.json"), JSON.stringify(newsCategories, null, 2));

  const articleIndex: { $ref: string }[] = [];
  const sortedArticles = [...articles].sort((a, b) => {
    const idA = String(a.id);
    const idB = String(b.id);
    return idB.localeCompare(idA);
  });

  const BATCH_SIZE = 100;
  for (let i = 0; i < sortedArticles.length; i += BATCH_SIZE) {
    const batch = sortedArticles.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (article) => {
        const articleData = {
          id: String(article.id),
          title: article.title,
          date: article.date,
          summary: article.summary ?? "",
          abstract: null,
          category: article.category,
          href: article.href,
          image: article.coverImageUrl,
          author: article.author,
          content: article.content,
          click: article.viewCount ?? 0,
          create_time: article.createTime,
          update_time: article.updateTime,
        };
        await writeFile(join(articlesDir, `${article.id}.json`), JSON.stringify(articleData, null, 2));
      }),
    );
  }

  for (const article of sortedArticles) {
    articleIndex.push({ $ref: `./articles/${article.id}.json` });
  }

  await writeFile(join(articlesDir, "index.json"), JSON.stringify(articleIndex, null, 2));
  console.log(`[business-data] wrote ${sortedArticles.length} article(s)`);

  // 6. 生成 schema.json
  const schema = {
    $schema: "./schema.json",
    siteConfig: "./site.config.json",
    tenant: tenantCode,
    layouts: layoutsMap,
    articleDetailTemplate: articleDetailTemplateRef,
    pages: pageRefs,
  };

  await writeFile(join(outputDir, "schema.json"), JSON.stringify(schema, null, 2));
  console.log(`[business-data] wrote schema.json (tenant=${tenantCode})`);
  console.log("[business-data] transform done");
}
