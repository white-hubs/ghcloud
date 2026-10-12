// oxlint-disable no-console
// oxlint-disable curly
// oxlint-disable no-plusplus
// oxlint-disable no-shadow
// oxlint-disable typescript/array-type
// oxlint-disable radix
// oxlint-disable typescript/no-explicit-any
// oxlint-disable no-empty
// oxlint-disable no-unused-vars
// oxlint-disable no-magic-numbers
// oxlint-disable no-lone-blocks
// oxlint-disable complexity
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "fs";
import { join, relative } from "path";
import * as readline from "readline";

// ═══════════════════════════════════════════════════════════════
// 配置区
// ═══════════════════════════════════════════════════════════════
const FALLBACK_LAYOUT_ID = "2048361345467662338";

const CONFIG = {
  baseUrl: "https://cube-test.guhecloud.com:30000//api/guhecloudWebsite",
  bearerToken:
    "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIxNzgzNTMxNCIsIjM1Mzc5ODI5IiwiNzI3MzQyMTEiLCI0Mzk1MDI0MiIsIjkyNTM0NDAzIiwiNTEyNTk3MzUiLCI5OTE3NDExMyIsIjU2OTUwODk2IiwiNzYxMjUxOTgiLCIxNTQ0MTI3OSJdLCJwYXNzd29yZF9leHBpcmVkIjpmYWxzZSwidXNlcl9uYW1lIjoiMTczMTEzNjk3ODIiLCJpc3MiOiJodHRwOi8vMTkyLjE2OC4wLjI0MzoxMDA4NiIsImFkbWluIjpmYWxzZSwicGFzc3dvcmRfZm9yY2VkIjp0cnVlLCJhdWQiOiJjbGllbnRfMiIsInBhc3N3b3JkX2V4cGlyYXRpb25fcmVtaW5kZWQiOmZhbHNlLCJuYmYiOjE3Nzc1NTY2OTMsImFkbWluaXN0cmF0ZWRfdGVuYW50cyI6WyI1ODE5NzI2MCIsIjU5OTk2MDUyIiwiMTgzMjE2MDIiLCI4Mjk3MDE0MCIsIjYyMjIwODk3IiwiNDYyNDI3MjgiLCI0NzU3ODE2MSIsIjYwNTE2MjY4IiwiNTU3NjQzNSIsIjE3ODM1MzE0IiwiMzUzNzk4MjkiLCI3MjczNDIxMSIsIjQzOTUwMjQyIiwiOTI1MzQ0MDMiLCI1MTI1OTczNSIsIjk5MTc0MTEzIiwiNTY5NTA4OTYiLCI3NjEyNTE5OCIsIjE1NDQxMjc5Il0sInNjb3BlIjpbInNlbGVjdCJdLCJuYW1lIjoi6LaF57qn566h55CG5ZGYMyIsInBhc3N3b3JkX2V4cGlyYXRpb25fZGF0ZSI6eyJkYXRlIjp7InllYXIiOjIwMjYsIm1vbnRoIjo5LCJkYXkiOjE3fSwidGltZSI6eyJob3VyIjoxNiwibWludXRlIjo1Niwic2Vjb25kIjoyNSwibmFubyI6MH19LCJpZCI6IjE0Nzg2MzY4ODY5ODQ1MjM3NzciLCJleHAiOjE4Nzc1NTY2OTMsImlhdCI6MTc3NzU1NjY5MywianRpIjoiNzQwMzYzYTUtOTQ5NC00NGE3LTkwYzAtNzc1ODJmYzYzYTc2In0.TwYtptE0xuPNaljbJ8IcesUW2vZsrDqRbdcpG3no56AmmoH9iI09A2y0aaGZUwLwovBM9M9EWEmUA7hScb3g6P54wxrGV5qcZ3ktal7l5pjncSCXMZNDlcMlUV9s6Wz_CBhSTWGdCE31HtparJqtopX-AZFA7LlkbDE5yZDJIn4a7wtNWpv2SFDTVXCDzci0bQX_UiOMqx43sQ4a4whCIhw-uA4DxcUXLqObF9DFrxs8ahhWLYMDBoHW-P8lsTUQwhYXqt0uGUVg69TLfOlKcqFX-yQNga-9nhpPBxyF3i0r0ltsrPvDiAkSNCebpJ-aeEzV0P4BsMX6v5aLEqXvWQ",
  dryRun: false,
  rateLimitMs: 150,
  maxRetries: 3,
};

// ═══════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function buildHeaders(): Record<string, string> {
  return {
    "content-type": "application/json;charset=utf-8",
    tenant: "58197260",
    terminal: "bimops-manage-web",
    authorization: `Bearer ${CONFIG.bearerToken}`,
  };
}

async function apiCall(method: string, path: string, payload?: any): Promise<{ ok: boolean; status: number; data: any }> {
  const url = `${CONFIG.baseUrl}${path}`;
  const options: RequestInit = {
    method,
    headers: buildHeaders(),
  };
  if (payload !== undefined && method !== "GET") {
    options.body = JSON.stringify(payload);
  }

  if (CONFIG.dryRun && method !== "GET") {
    return { ok: true, status: 200, data: null };
  }

  try {
    const res = await fetch(url, options);
    let data: any = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    return { ok: false, status: 0, data: err.message };
  }
}

async function apiCallWithRetry(
  method: string,
  path: string,
  payload?: any,
  retry = 0,
): Promise<{ ok: boolean; status: number; data: any }> {
  const result = await apiCall(method, path, payload);
  if (!result.ok && retry < CONFIG.maxRetries) {
    await sleep(CONFIG.rateLimitMs * 2);
    return apiCallWithRetry(method, path, payload, retry + 1);
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// 数据加载
// ═══════════════════════════════════════════════════════════════

const outputDir = join(process.cwd(), "output");

function loadJson(path: string): any {
  return JSON.parse(readFileSync(join(outputDir, path), "utf-8"));
}

function loadAllPages(): { relPath: string; data: any }[] {
  const pagesDir = join(outputDir, "pages");
  const pages: { relPath: string; data: any }[] = [];
  function walk(dir: string, relDir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const srcPath = join(dir, entry.name);
      const relPath = join(relDir, entry.name);
      if (entry.isDirectory()) {
        walk(srcPath, relPath);
      } else if (entry.name.endsWith(".json")) {
        pages.push({ relPath, data: JSON.parse(readFileSync(srcPath, "utf-8")) });
      }
    }
  }
  walk(pagesDir, "");
  return pages;
}

function loadAllArticles(): { file: string; data: any }[] {
  const articlesDir = join(outputDir, "articles");
  return readdirSync(articlesDir)
    .filter((f) => f.endsWith(".json") && f !== "index.json" && f !== "news-categories.json")
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map((file) => ({ file, data: JSON.parse(readFileSync(join(articlesDir, file), "utf-8")) }));
}

const rl = readline.createInterface({ input: process.stdin as any, output: process.stdout as any });

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

async function selectPhases(): Promise<Set<number>> {
  console.log("\n=== 选择要更新的数据 ===");
  console.log("  1. 网站设置   (settings)");
  console.log("  2. 布局       (layouts)");
  console.log("  3. 文章分类   (categories)");
  console.log("  4. 页面       (pages)");
  console.log("  5. 文章       (articles)");
  console.log("  a. 全部       (all)");

  const input = (await question("\n请输入要更新的项编号（逗号分隔，如 1,3,5 或 1-3，输入 a 选择全部）: ")).trim();

  if (!input || input.toLowerCase() === "a" || input.toLowerCase() === "all") {
    return new Set([1, 2, 3, 4, 5]);
  }

  const selected = new Set<number>();
  const parts = input.split(",");

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-");
      const start = parseInt(startStr?.trim() || "1", 10);
      const end = parseInt(endStr?.trim() || "5", 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
          if (i >= 1 && i <= 5) selected.add(i);
        }
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 1 && num <= 5) {
        selected.add(num);
      }
    }
  }

  if (selected.size === 0) {
    return new Set([1, 2, 3, 4, 5]);
  }

  return selected;
}

// ═══════════════════════════════════════════════════════════════
// 主流程
// ═══════════════════════════════════════════════════════════════

interface CategoryMapping {
  [categoryName: string]: string;
}

interface MigrationResult {
  phase: string;
  name: string;
  ok: boolean;
  status: number;
  detail: string;
}

// oxlint-disable-next-line max-lines-per-function
async function main() {
  const results: MigrationResult[] = [];

  // ── Phase 0: 获取后端现有数据 ───────────────────────────────────

  const categoryRes = await apiCallWithRetry("GET", "/website/article/category/tree");
  let existingCategories: { id: string; categoryName: string; pathId: string; sort: number; status: string }[] = [];
  if (categoryRes.ok && Array.isArray(categoryRes.data)) {
    existingCategories = categoryRes.data;
  } else if (CONFIG.dryRun) {
  } else {
  }

  const layoutRes = await apiCallWithRetry("GET", "/website/layout/list");
  let existingLayouts: { id: string; layoutName: string; config: string }[] = [];
  if (layoutRes.ok && Array.isArray(layoutRes.data)) {
    existingLayouts = layoutRes.data;
  } else if (CONFIG.dryRun) {
  } else {
  }

  const pageRes = await apiCallWithRetry("GET", "/website/page/list");
  let existingPages: { id: string; pageName: string; pageRoute: string }[] = [];
  if (pageRes.ok && Array.isArray(pageRes.data)) {
    existingPages = pageRes.data;
  } else if (CONFIG.dryRun) {
  } else {
  }

  // ── Phase 0b: 获取现有文章列表（分页拉取）────────────────────────

  const existingArticles: Array<{ id: string; title: string; categoryId: string }> = [];
  let articlePage = 1;
  const articlePageSize = 100;
  let articleTotal = 0;
  while (true) {
    const articleListRes = await apiCallWithRetry("GET", `/website/article/page?pageNumber=${articlePage}&pageSize=${articlePageSize}`);
    if (articleListRes.ok && articleListRes.data && Array.isArray(articleListRes.data.records)) {
      const { records } = articleListRes.data;
      existingArticles.push(...records);
      articleTotal = articleListRes.data.total || 0;
      if (records.length < articlePageSize || existingArticles.length >= articleTotal) {
        break;
      }
      articlePage += 1;
    } else if (CONFIG.dryRun) {
      break;
    } else {
      break;
    }
  }

  // 建立文章映射: key = title|categoryId
  const articleMapping: Record<string, { id: string; title: string; categoryId: string }> = {};
  for (const art of existingArticles) {
    const key = `${art.title}|${art.categoryId}`;
    articleMapping[key] = art;
  }

  // 交互选择要执行的 phases
  const phases = await selectPhases();
  if (phases.size === 0) {
    rl.close();
    return;
  }

  // 预加载共享数据（不依赖具体 phase 选择）
  const siteConfig = loadJson("site-config.json");
  const layoutData = loadJson("layouts/default.json");
  const articles = loadAllArticles();
  const pages = loadAllPages();

  // 提前初始化 layoutId（供 Phase 4 使用）
  let layoutId = "";
  const existingDefaultLayout = existingLayouts.find((l) => l.layoutName === "default");
  if (existingDefaultLayout) {
    layoutId = String(existingDefaultLayout.id);
  }
  if (!layoutId) {
    layoutId = FALLBACK_LAYOUT_ID;
  }

  // 提前初始化 categoryMapping（供 Phase 5 使用）
  const categoryMapping: CategoryMapping = {};
  for (const cat of existingCategories) {
    categoryMapping[cat.categoryName] = String(cat.id);
  }
  const uniqueCategories = Array.from(new Set(articles.map((a) => a.data.category).filter(Boolean)));

  // ── Phase 1: 网站设置 ───────────────────────────────────────────
  if (phases.has(1)) {
    // 从 SiteFooter 提取联系信息
    const footerComp = layoutData.components?.find((c: any) => c.name === "SiteFooter")?.props || {};
    const socialMap: Record<string, string> = {};
    for (const s of footerComp.socialLinks || []) {
      if (s.name === "头条") {
        socialMap.toutiao = s.url;
      }
      if (s.name === "知乎") {
        socialMap.zhihu = s.url;
      }
      if (s.name === "小红书") {
        socialMap.xiaohongshu = s.url;
      }
      if (s.name === "抖音") {
        socialMap.douyin = s.url;
      }
    }
    const contact = footerComp.contacts || [];
    const phoneContact = contact.find((c: any) => c.label === "咨询热线");
    const emailContact = contact.find((c: any) => c.label === "公司邮箱");

    const settingPayload = {
      siteName: siteConfig.site?.name || "",
      url: siteConfig.site?.url || "",
      ogImage: siteConfig.site?.ogImage || "",
      favicon: siteConfig.site?.favicon || "",
      primaryColor: siteConfig.site?.primaryColor || "",
      defaultTitle: siteConfig.seo?.defaultTitle || "",
      defaultDescription: siteConfig.seo?.defaultDescription || "",
      defaultKeywords: siteConfig.seo?.defaultKeywords || "",
      trackingScripts: siteConfig.trackingScripts ? JSON.stringify(siteConfig.trackingScripts) : "",
      siteLogo: siteConfig.site?.ogImage || "",
      copyright: footerComp.copyrightYear ? `©${footerComp.copyrightYear} ${footerComp.copyrightCompany || ""}` : "",
      icpInfo: footerComp.icp || "",
      contactPhone: phoneContact?.value || footerComp.phone || "",
      contactEmail: emailContact?.value || "",
      officialAccount: footerComp.qrCodes?.[0]?.image || "",
      videoAccount: footerComp.qrCodes?.[1]?.image || "",
      douyin: socialMap.douyin || "",
      toutiao: socialMap.toutiao || "",
      zhihu: socialMap.zhihu || "",
      xiaohongshu: socialMap.xiaohongshu || "",
    };

    const settingRes = await apiCallWithRetry("PUT", "/website/setting", settingPayload);
    results.push({
      phase: "setting",
      name: "website-setting",
      ok: settingRes.ok,
      status: settingRes.status,
      detail: JSON.stringify(settingRes.data).slice(0, 200),
    });
    if (settingRes.ok) {
    } else {
    }

    await sleep(CONFIG.rateLimitMs);
  }

  // ── Phase 2: 布局 ───────────────────────────────────────────────
  if (phases.has(2)) {
    const layoutPayload = {
      layoutName: "default",
      config: JSON.stringify(layoutData),
    };

    if (existingDefaultLayout) {
      const updateRes = await apiCallWithRetry("PUT", `/website/layout`, {
        ...layoutPayload,
        id: existingDefaultLayout.id,
      });
      results.push({
        phase: "layout",
        name: "default",
        ok: updateRes.ok,
        status: updateRes.status,
        detail: JSON.stringify(updateRes.data).slice(0, 200),
      });
      if (updateRes.ok) {
      } else {
      }
    } else {
      const createRes = await apiCallWithRetry("POST", "/website/layout", layoutPayload);
      results.push({
        phase: "layout",
        name: "default",
        ok: createRes.ok,
        status: createRes.status,
        detail: JSON.stringify(createRes.data).slice(0, 200),
      });
      if (createRes.ok) {
      } else {
      }

      // 创建后重新获取 layoutId
      if (createRes.ok) {
        const freshLayoutRes = await apiCallWithRetry("GET", "/website/layout/list");
        if (freshLayoutRes.ok && Array.isArray(freshLayoutRes.data)) {
          const freshDefault = freshLayoutRes.data.find((l: any) => l.layoutName === "default");
          if (freshDefault) {
            layoutId = String(freshDefault.id);
          }
        }
      }
    }
    await sleep(CONFIG.rateLimitMs);

    if (!layoutId) {
      layoutId = FALLBACK_LAYOUT_ID;
    }
  }

  // ── Phase 3: 文章分类 ───────────────────────────────────────────
  if (phases.has(3)) {
    let categoryCreated = 0;
    let categorySkipped = 0;
    for (const catName of uniqueCategories) {
      if (categoryMapping[catName]) {
        categorySkipped++;
        continue;
      }
      const createRes = await apiCallWithRetry("POST", "/website/article/category", {
        categoryName: catName,
        parentId: 0,
        sort: 0,
        status: 1,
      });
      results.push({
        phase: "category",
        name: catName,
        ok: createRes.ok,
        status: createRes.status,
        detail: JSON.stringify(createRes.data).slice(0, 200),
      });
      if (createRes.ok && createRes.data?.id) {
        categoryMapping[catName] = String(createRes.data.id);
        categoryCreated++;
      } else if (createRes.ok && CONFIG.dryRun) {
        categoryMapping[catName] = `dry-run-${catName}`;
        categoryCreated++;
      } else if (createRes.ok) {
        // 创建成功但没有返回 id，需要重新获取
        const freshRes = await apiCallWithRetry("GET", "/website/article/category/tree");
        if (freshRes.ok && Array.isArray(freshRes.data)) {
          const found = freshRes.data.find((c: any) => c.categoryName === catName);
          if (found) {
            categoryMapping[catName] = String(found.id);
            categoryCreated++;
          }
        }
      } else {
      }
      if (!CONFIG.dryRun) {
        await sleep(CONFIG.rateLimitMs);
      }
    }
  }

  // ── Phase 4: 页面 ───────────────────────────────────────────────
  if (phases.has(4)) {
    let pageSent = 0;
    let pageCreated = 0;
    let pageUpdated = 0;
    let pageSkipped = 0;
    for (const { relPath, data } of pages) {
      const pageName = relPath.replace(/\.json$/, "").replace(/\//g, "-");
      if (!data.path) {
        pageSkipped++;
        continue;
      }
      const existingPage = existingPages.find((p) => p.pageRoute === data.path);

      const pagePayload: any = {
        pageName,
        pageRoute: data.path || "/",
        layoutId: layoutId || "0",
        metaNavStyle: data.meta?.navStyle || "light",
        metaTitle: data.meta?.title || "",
        metaDescription: data.meta?.description || "",
        metaKeywords: data.meta?.keywords || "",
        components: data.components ? JSON.stringify(data.components) : "[]",
      };

      let pageRes;
      if (existingPage) {
        pageRes = await apiCallWithRetry("PUT", `/website/page/${existingPage.id}`, { ...pagePayload, id: existingPage.id });
        results.push({
          phase: "page",
          name: pageName,
          ok: pageRes.ok,
          status: pageRes.status,
          detail: JSON.stringify(pageRes.data).slice(0, 200),
        });
        if (pageRes.ok) {
          pageUpdated++;
        } else {
        }
      } else {
        pageRes = await apiCallWithRetry("POST", "/website/page", pagePayload);
        results.push({
          phase: "page",
          name: pageName,
          ok: pageRes.ok,
          status: pageRes.status,
          detail: JSON.stringify(pageRes.data).slice(0, 200),
        });
        if (pageRes.ok) {
          pageCreated++;
        } else {
        }
      }

      pageSent += 1;
      if (pageSent % 10 === 0) {
      }
      if (!CONFIG.dryRun) {
        await sleep(CONFIG.rateLimitMs);
      }
    }
  }

  // ── Phase 5: 文章 ───────────────────────────────────────────────
  if (phases.has(5)) {
    let articleSent = 0;
    let articleCreated = 0;
    let articleUpdated = 0;
    let articleFailed = 0;
    let articleSkipped = 0;
    for (const { file, data } of articles) {
      const categoryId = categoryMapping[data.category];
      if (!categoryId) {
        articleSkipped++;
        if (articleSkipped <= 3) {
        }
        continue;
      }

      const articlePayload = {
        title: data.title || "",
        categoryId,
        coverImageUrl: data.image || "",
        summary: data.summary || data.abstract || "",
        content: data.content || "",
        author: data.author || "",
        status: 1,
      };

      const articleKey = `${articlePayload.title}|${articlePayload.categoryId}`;
      const existingArticle = articleMapping[articleKey];

      let articleRes;
      if (existingArticle) {
        articleRes = await apiCallWithRetry("PUT", `/website/article/${existingArticle.id}`, { ...articlePayload, id: existingArticle.id });
        results.push({
          phase: "article",
          name: `${file} — ${data.title?.slice(0, 30)}`,
          ok: articleRes.ok,
          status: articleRes.status,
          detail: JSON.stringify(articleRes.data).slice(0, 200),
        });
        if (articleRes.ok) {
          articleUpdated++;
        } else {
          articleFailed++;
        }
      } else {
        articleRes = await apiCallWithRetry("POST", "/website/article", articlePayload);
        results.push({
          phase: "article",
          name: `${file} — ${data.title?.slice(0, 30)}`,
          ok: articleRes.ok,
          status: articleRes.status,
          detail: JSON.stringify(articleRes.data).slice(0, 200),
        });
        if (articleRes.ok) {
          articleCreated++;
        } else {
          articleFailed++;
        }
      }

      articleSent += 1;
      if (articleSent % 50 === 0) {
        const pct = Math.round((articleSent / articles.length) * 100);
      }

      if (!CONFIG.dryRun) {
        await sleep(CONFIG.rateLimitMs);
      }
    }

    if (articleSkipped > 0) {
    }
  }

  // ── Summary ─────────────────────────────────────────────────────

  const byPhase: Record<string, { total: number; ok: number; fail: number }> = {};
  for (const r of results) {
    if (!byPhase[r.phase]) {
      byPhase[r.phase] = { total: 0, ok: 0, fail: 0 };
    }
    byPhase[r.phase]!.total += 1;
    if (r.ok) byPhase[r.phase]!.ok += 1;
    else {
      byPhase[r.phase]!.fail++;
    }
  }

  for (const [phase, stat] of Object.entries(byPhase)) {
    const phaseLabel = phase.padEnd(12);
    const totalLabel = String(stat.total).padStart(5);
    const okLabel = String(stat.ok).padStart(5);
    const failLabel = String(stat.fail).padStart(6);
  }

  const totalOk = results.filter((r) => r.ok).length;
  const totalFail = results.filter((r) => !r.ok).length;

  const reportPath = join(process.cwd(), "migrate-v2-report.json");
  writeFileSync(reportPath, JSON.stringify(results, null, 2));

  rl.close();
}

main().catch((err) => {
  process.exit(1);
});
