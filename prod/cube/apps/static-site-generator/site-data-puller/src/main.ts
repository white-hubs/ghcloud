import { resolve } from "node:path";

import { SiteDataApi } from "./api.ts";
import { ApiClient } from "./client.ts";
import { loadConfig } from "./config.ts";
import { transformArticles } from "./transformers/articles.ts";
import { transformCategories } from "./transformers/categories.ts";
import { transformLayouts } from "./transformers/layouts.ts";
import { transformPages } from "./transformers/pages.ts";
import { transformSetting } from "./transformers/setting.ts";
import { ensureDir, joinPath, removeDir } from "./utils/fs.ts";
import { stringifyBigIntAsNumber } from "./utils/json.ts";
import { createZip } from "./utils/zip.ts";

async function main(): Promise<void> {
  const config = loadConfig();

  const client = new ApiClient(config);
  const api = new SiteDataApi(client);

  // 预检：dry-run 直接结束
  if (config.dryRun) {
    console.log("[dry-run] 将要拉取的数据：");
    await api.fetchSetting();
    await api.fetchLayouts();
    const samplePages = await api.fetchPages();
    console.log(`[dry-run] GET ${config.baseUrl}/website/page/{id}（共 ${samplePages.length} 个页面详情）`);
    await api.fetchCategoryTree();
    console.log(`[dry-run] GET ${config.baseUrl}/website/article/page?pageNumber={n}&pageSize=${config.pageSize}（分页拉取直到结束）`);
    console.log("[dry-run] 结束");
    return;
  }

  // 拉取数据
  console.log("[pull] 开始拉取网站设置...");
  const settingApi = await api.fetchSetting();
  const setting = transformSetting(settingApi);

  console.log("[pull] 开始拉取布局列表...");
  const layoutsApi = await api.fetchLayouts();
  console.log(`[pull] 开始拉取 ${layoutsApi.length} 个布局详情...`);
  const layoutsWithDetail = await api.fetchAllLayoutDetails(layoutsApi, config.rateLimitMs);
  const layouts = transformLayouts(layoutsWithDetail);

  console.log("[pull] 开始拉取页面列表...");
  const pagesApi = await api.fetchPages();
  console.log(`[pull] 开始拉取 ${pagesApi.length} 个页面详情...`);
  const pagesWithDetail = await api.fetchAllPageDetails(pagesApi, config.rateLimitMs);
  const pages = transformPages(pagesWithDetail, layoutsWithDetail);

  console.log("[pull] 开始拉取文章分类...");
  const categoriesApi = await api.fetchCategoryTree();
  const categories = transformCategories(categoriesApi);

  console.log("[pull] 开始拉取文章（分页）...");
  const articlesApi = await api.fetchAllArticles(config.pageSize, config.rateLimitMs);
  const articles = transformArticles(articlesApi);

  // 准备输出目录（使用绝对路径，避免 zip cwd 歧义）
  const outputRoot = resolve(config.outputDir);
  const siteDir = joinPath(outputRoot, config.siteDirName);
  await ensureDir(siteDir);

  // 写入 JSON 文件
  const files = [
    { name: "site-setting.json", data: setting },
    { name: "site-layouts.json", data: layouts },
    { name: "site-pages.json", data: pages },
    { name: "article-categories.json", data: categories },
    { name: "articles.json", data: articles },
  ];

  for (const { name, data } of files) {
    const filePath = joinPath(siteDir, name);
    await Bun.write(filePath, stringifyBigIntAsNumber(data));
    console.log(`[pull] 已写入 ${filePath}`);
  }

  // 打包为 ZIP
  const zipPath = joinPath(outputRoot, `${config.siteDirName}.zip`);
  await createZip(siteDir, zipPath);
  console.log(`[pull] 已生成压缩包 ${zipPath}`);

  // 删除临时文件夹，仅保留 ZIP
  await removeDir(siteDir);
  console.log(`[pull] 已清理临时目录 ${siteDir}`);

  // 摘要
  console.log("\n[pull] 完成摘要：");
  console.log(`  输出目录: ${outputRoot}`);
  console.log(`  压缩包:   ${zipPath}`);
  console.log(`  布局数:   ${layouts.length}`);
  console.log(`  页面数:   ${pages.length}`);
  console.log(`  分类数:   ${categories.length}`);
  console.log(`  文章数:   ${articles.length}`);
}

main().catch((err) => {
  console.error("[pull] 执行失败:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
