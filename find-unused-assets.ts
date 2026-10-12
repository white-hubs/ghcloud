/**
 * 查找未使用的静态资源文件
 * 扫描 prod 与 legacy 下的图片、字体等，在源码中搜索引用，输出未引用列表并可删除
 */
import { readdirSync, statSync, readFileSync, existsSync } from "fs";
import { join, basename } from "path";

const STATIC_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".woff", ".woff2", ".ttf", ".eot"]);
const SCAN_DIRS = ["prod", "legacy"];

// 以下路径模式下的静态资源不删除（可能被动态引用）
const EXCLUDE_PATTERNS = [
  /favicon\.png$/i,
  /\/public\/favicon\./i,
  /visual-low-code\/src\/assets\/images\//, // import.meta.glob 动态加载
  /cube-webgl-sandbox\/public\/textures\//, // 运行时纹理
  /cube-webgl-sandbox\/public\/bootstrap-icons\//, // 图标集可能按名加载
  /operating-room\/data-viz\/src\/assets\/template-three\/images\//, // getImageThree 动态路径
  /merchant-evaluation-migrate\/src\/assets\/icons\//, // require.context 动态加载 png/svg
  /\/dist\//, // 构建产物不应在扫描列表，此处为双保险
];
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "dist-ssr"]);
const SOURCE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".vue", ".less", ".css", ".scss", ".html", ".json", ".md"]);

function collectStaticFiles(root: string, dir: string, list: string[]): void {
  const full = join(root, dir);
  if (!existsSync(full)) return;
  const stat = statSync(full);
  if (!stat.isDirectory()) return;
  const entries = readdirSync(full, { withFileTypes: true });
  for (const e of entries) {
    const rel = join(dir, e.name);
    const fullPath = join(root, rel);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      collectStaticFiles(root, rel, list);
    } else {
      const ext = join(rel).match(/\.[^.]+$/)?.[0] ?? "";
      if (STATIC_EXT.has(ext.toLowerCase())) list.push(rel);
    }
  }
}

function collectSourceFiles(root: string, dir: string, list: string[]): void {
  const full = join(root, dir);
  if (!existsSync(full)) return;
  const stat = statSync(full);
  if (!stat.isDirectory()) return;
  const entries = readdirSync(full, { withFileTypes: true });
  for (const e of entries) {
    const rel = join(dir, e.name);
    const fullPath = join(root, rel);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      collectSourceFiles(root, rel, list);
    } else {
      const ext = join(rel).match(/\.[^.]+$/)?.[0] ?? "";
      if (SOURCE_EXT.has(ext.toLowerCase())) list.push(rel);
    }
  }
}

function loadSourceContents(root: string, sourceFiles: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const src of sourceFiles) {
    const path = join(root, src);
    if (!existsSync(path)) continue;
    try {
      map.set(src, readFileSync(path, "utf-8"));
    } catch {
      // skip
    }
  }
  return map;
}

function isReferenced(assetRel: string, sourceContents: Map<string, string>): boolean {
  const name = basename(assetRel);
  const pathSlash = assetRel.replace(/\\/g, "/");
  for (const content of sourceContents.values()) {
    if (content.includes(name) || content.includes(pathSlash)) return true;
  }
  return false;
}

function main(): void {
  const root = process.cwd();
  const staticFiles: string[] = [];
  const sourceFiles: string[] = [];
  for (const d of SCAN_DIRS) {
    const base = join(root, d);
    if (!existsSync(base)) continue;
    const staticList: string[] = [];
    const sourceList: string[] = [];
    collectStaticFiles(base, "", staticList);
    collectSourceFiles(base, "", sourceList);
    for (const f of staticList) {
      staticFiles.push(join(d, f));
    }
    for (const f of sourceList) {
      sourceFiles.push(join(d, f));
    }
  }
  const sourceContents = loadSourceContents(root, sourceFiles);
  const unused: string[] = [];
  for (const asset of staticFiles) {
    const full = join(root, asset);
    if (!existsSync(full)) continue;
    if (!isReferenced(asset, sourceContents)) {
      unused.push(asset);
    }
  }
  const toDelete = unused.filter((u) => {
    return !EXCLUDE_PATTERNS.some((p) => p.test(u.replace(/\\/g, "/")));
  });
  const excludedCount = unused.length - toDelete.length;
  for (const u of toDelete) {
  }
  if (process.argv.includes("--delete") && toDelete.length > 0) {
    const { unlinkSync } = require("fs");
    for (const u of toDelete) {
      try {
        unlinkSync(join(root, u));
      } catch (e) {
      }
    }
  }
}

main();
