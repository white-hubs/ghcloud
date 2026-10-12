// oxlint-disable max-lines-per-function
// oxlint-disable no-void
// oxlint-disable no-console
// oxlint-disable no-plusplus
// oxlint-disable typescript/no-explicit-any
// oxlint-disable curly
// oxlint-disable no-magic-numbers
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, readdirSync } from "fs";
import { join, dirname, relative } from "path";

const INPUT_DIR = "../generator-cli/test-site";
const OUTPUT_DIR = "./output";

function resolveRef(refPath: string, baseDir: string, rootDir?: string): any {
  const fullPath = join(baseDir, refPath);
  if (!existsSync(fullPath)) {
    return null;
  }
  const content = JSON.parse(readFileSync(fullPath, "utf-8"));
  return inlineRefs(content, dirname(fullPath), rootDir || baseDir);
}

function inlineRefs(value: any, baseDir: string, rootDir: string): any {
  void baseDir;
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => inlineRefs(item, baseDir, rootDir));
  }

  if (value.$ref && typeof value.$ref === "string") {
    return resolveRef(value.$ref, rootDir);
  }

  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(value)) {
    result[key] = inlineRefs(val, baseDir, rootDir);
  }
  return result;
}

function replaceTenant(value: any): any {
  // 注意：数据中的 guhecloud.com 是真实域名，不应替换
  // tenant 标识通过 API Header 传递，不在数据中替换
  return value;
}

function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function getFileSize(path: string): number {
  return statSync(path).size;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  const inputDir = join(process.cwd(), INPUT_DIR);
  const outputDir = join(process.cwd(), OUTPUT_DIR);


  ensureDir(outputDir);

  // ── 1. Site Config ──────────────────────────────────────────────
  const siteConfigPath = join(inputDir, "site.config.json");
  let siteConfig: any = {};
  if (existsSync(siteConfigPath)) {
    siteConfig = JSON.parse(readFileSync(siteConfigPath, "utf-8"));
    siteConfig = replaceTenant(siteConfig);
    writeFileSync(join(outputDir, "site-config.json"), JSON.stringify(siteConfig, null, 2));
  } else {
  }

  // ── 2. Layouts ──────────────────────────────────────────────────
  const layoutsDir = join(inputDir, "layouts");
  const layoutsOutputDir = join(outputDir, "layouts");
  ensureDir(layoutsOutputDir);

  let layoutCount = 0;
  if (existsSync(layoutsDir)) {
    for (const file of readdirSync(layoutsDir)) {
      if (!file.endsWith(".json")) continue;
      const srcPath = join(layoutsDir, file);
      const data = JSON.parse(readFileSync(srcPath, "utf-8"));
      const inlined = replaceTenant(inlineRefs(data, dirname(srcPath), inputDir));
      writeFileSync(join(layoutsOutputDir, file), JSON.stringify(inlined, null, 2));
      layoutCount++;
    }
  }

  // ── 3. Pages ────────────────────────────────────────────────────
  const pagesDir = join(inputDir, "pages");
  const pagesOutputDir = join(outputDir, "pages");
  ensureDir(pagesOutputDir);

  let pageCount = 0;
  let pageTotalSize = 0;
  let largestPage = { path: "", size: 0 };

  function processPagesDir(srcDir: string, destDir: string) {
    ensureDir(destDir);
    for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
      const srcPath = join(srcDir, entry.name);
      const destPath = join(destDir, entry.name);
      if (entry.isDirectory()) {
        processPagesDir(srcPath, destPath);
      } else if (entry.name.endsWith(".json")) {
        const data = JSON.parse(readFileSync(srcPath, "utf-8"));
        // 原样复制，不做 inlineRefs，避免篡改 NewsSection 等 $ref 引用结构
        // generator-cli 构建时会自行解析 $ref
        writeFileSync(destPath, JSON.stringify(data, null, 2));
        pageCount++;
        if (pageCount % 10 === 0) {
        }
        const size = getFileSize(destPath);
        pageTotalSize += size;
        if (size > largestPage.size) {
          largestPage = { path: relative(pagesOutputDir, destPath), size };
        }
      }
    }
  }

  if (existsSync(pagesDir)) {
    processPagesDir(pagesDir, pagesOutputDir);
  }

  // ── 4. Articles ─────────────────────────────────────────────────
  const articlesDir = join(inputDir, "articles");
  const articlesOutputDir = join(outputDir, "articles");
  ensureDir(articlesOutputDir);

  let articleCount = 0;
  let articleTotalSize = 0;
  let largestArticle = { path: "", size: 0 };

  if (existsSync(articlesDir)) {
    for (const file of readdirSync(articlesDir)) {
      if (!file.endsWith(".json")) continue;
      const srcPath = join(articlesDir, file);
      const data = JSON.parse(readFileSync(srcPath, "utf-8"));
      const inlined = replaceTenant(inlineRefs(data, dirname(srcPath), inputDir));
      const destPath = join(articlesOutputDir, file);
      writeFileSync(destPath, JSON.stringify(inlined, null, 2));
      articleCount++;
      if (articleCount % 50 === 0) {
      }
      const size = getFileSize(destPath);
      articleTotalSize += size;
      if (size > largestArticle.size) {
        largestArticle = { path: file, size };
      }
    }
  }

  // ── Summary ─────────────────────────────────────────────────────
}

main().catch((err) => {
  process.exit(1);
});
