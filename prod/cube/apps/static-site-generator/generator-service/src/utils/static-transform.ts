// oxlint-disable no-magic-numbers
// oxlint-disable no-console
import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, writeFile, readdir, readFile, stat } from "node:fs/promises";
import { join, extname, dirname, basename } from "node:path";

const MAX_CONCURRENT_PER_HOST = 6;
const MAX_TOTAL_CONCURRENT = 24;
const DOWNLOAD_TIMEOUT_MS = 30000;
const MAX_RETRIES = 3;

const STATIC_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".ico",
  ".bmp",
  ".mp4",
  ".webm",
  ".ogv",
  ".mov",
  ".m4v",
  ".mp3",
  ".ogg",
  ".wav",
  ".m4a",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".pdf",
]);

const EXCLUDE_EXTENSIONS = new Set([".html", ".htm", ".aspx", ".php", ".jsp", ".json", ".xml", ".js", ".css"]);

const STATIC_PATH_PATTERNS = [
  "/uploadfiles/",
  "/uploads/",
  "/images/",
  "/imgs/",
  "/video/",
  "/videos/",
  "/fonts/",
  "/assets/",
  "/static/",
  "/pictures/",
  "/pic/",
  "/file/",
  "/files/",
];

const EXT_FROM_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/x-icon": ".ico",
  "image/vnd.microsoft.icon": ".ico",
  "image/bmp": ".bmp",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/ogg": ".ogv",
  "video/quicktime": ".mov",
  "audio/mpeg": ".mp3",
  "audio/ogg": ".ogg",
  "audio/wav": ".wav",
  "audio/x-m4a": ".m4a",
  "application/pdf": ".pdf",
  "font/woff2": ".woff2",
  "font/woff": ".woff",
  "font/ttf": ".ttf",
  "font/otf": ".otf",
};

const SKIP_DIRS = new Set(["node_modules", ".git", "public"]);

function isStaticResourceUrl(url: string): boolean {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const ext = extname(pathname);
    if (ext) {
      if (EXCLUDE_EXTENSIONS.has(ext)) {
        return false;
      }
      if (STATIC_EXTENSIONS.has(ext)) {
        return true;
      }
    }
    return STATIC_PATH_PATTERNS.some((p) => pathname.includes(p));
  } catch {
    return false;
  }
}

export function normalizeExcludeHosts(raw: unknown): string[] {
  const list = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : [];
  return list
    .map((s) =>
      String(s)
        .trim()
        .toLowerCase()
        .replace(/^\.+|\.+$/g, ""),
    )
    .filter((s) => s.length > 0);
}

export function isExcludedHost(url: string, suffixes: string[]): boolean {
  if (suffixes.length === 0) {
    return false;
  }
  try {
    const host = new URL(url).hostname.toLowerCase();
    return suffixes.some((suf) => host === suf || host.endsWith(`.${suf}`));
  } catch {
    return false;
  }
}

function extractUrlsFromHtml(html: string): string[] {
  const urls: string[] = [];
  // match src / srcset / poster / data-src / data-original
  const regex = /\s(?:src|srcset|poster|data-src|data-original)\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const val = m[1].trim();
    if (m[0].includes("srcset")) {
      for (const part of val.split(",")) {
        const u = part.trim().split(/\s+/)[0];
        if (u.startsWith("http") && isStaticResourceUrl(u)) {
          urls.push(u);
        }
      }
    } else {
      if (val.startsWith("http") && isStaticResourceUrl(val)) {
        urls.push(val);
      }
    }
  }
  // loose https?://
  const loose = html.match(/https?:\/\/[^\s"'<>]+/g);
  if (loose) {
    for (const u of loose) {
      const clean = u.replace(/[)\]}>]$/, "");
      if (isStaticResourceUrl(clean)) {
        urls.push(clean);
      }
    }
  }
  return urls;
}

function extractStaticUrls(obj: unknown): string[] {
  const urls = new Set<string>();
  function walk(v: unknown) {
    if (v === null) {
      return;
    }
    if (typeof v === "string") {
      const t = v.trim();
      if (t.startsWith("http") && isStaticResourceUrl(t)) {
        urls.add(t);
        return;
      }
      if (v.includes("<") && v.includes(">")) {
        for (const u of extractUrlsFromHtml(v)) {
          urls.add(u);
        }
      }
      return;
    }
    if (Array.isArray(v)) {
      for (const item of v) {
        walk(item);
      }
      return;
    }
    if (typeof v === "object") {
      for (const val of Object.values(v as Record<string, unknown>)) {
        walk(val);
      }
    }
  }
  walk(obj);
  return Array.from(urls);
}

function getExtFromUrl(url: string): string | null {
  try {
    const ext = extname(new URL(url).pathname);
    if (ext && ext.length > 1 && ext.length <= 6) {
      return ext;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function inferExtFromContentType(ct: string | null): string | null {
  if (!ct) {
    return null;
  }
  const mime = ct.split(";")[0].trim().toLowerCase();
  return EXT_FROM_MIME[mime] || null;
}

function generateStaticFilename(url: string): string {
  const hash = createHash("sha256").update(url).digest("hex").slice(0, 12);
  const ext = getExtFromUrl(url) || ".bin";

  try {
    const pathname = decodeURIComponent(new URL(url).pathname);
    const base = basename(pathname);
    if (base && base !== pathname) {
      const nameWithoutExt = base.replace(/\.[^.]+$/, "");
      const clean = nameWithoutExt
        .replace(/[<>:"/\\|?*]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 50);
      if (clean.length > 0) {
        return `${clean}-${hash}${ext}`;
      }
    }
  } catch {
    /* ignore */
  }

  return `${hash}${ext}`;
}

export { generateStaticFilename };

function buildHeaders(referer: string | null): Record<string, string> {
  const h: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Sec-Fetch-Dest": "image",
    "Sec-Fetch-Mode": "no-cors",
    "Sec-Fetch-Site": "cross-site",
  };
  if (referer) {
    h.Referer = referer;
  }
  return h;
}

function isRetryableError(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (err.name === "AbortError" || msg.includes("abort")) {
      return true;
    }
    if (msg.includes("timeout") || msg.includes("network") || msg.includes("fetch")) {
      return true;
    }
    if (msg.includes("econnrefused") || msg.includes("enotfound") || msg.includes("etimedout")) {
      return true;
    }
  }
  return false;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateBackoff(attempt: number): number {
  const base = Math.min(1000 * 2 ** attempt, 10000);
  return base + Math.floor(Math.random() * 1000);
}

class Semaphore {
  private permits: number;
  private waiters: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits -= 1;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this.waiters.push(resolve);
    });
  }

  release(): void {
    if (this.waiters.length > 0) {
      const next = this.waiters.shift()!;
      next();
    } else {
      this.permits += 1;
    }
  }
}

async function downloadStream(response: Response, destPath: string): Promise<number> {
  const file = createWriteStream(destPath);
  const reader = response.body!.getReader();
  let size = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (!file.write(value)) {
        await new Promise<void>((resolve) => file.once("drain", resolve));
      }
      size += value.byteLength;
    }
  } finally {
    file.end();
    await new Promise<void>((resolve, reject) => {
      file.on("finish", resolve);
      file.on("error", reject);
    });
  }

  return size;
}

export async function downloadOne(
  url: string,
  destPath: string,
  referer: string | null,
  existingFiles?: Set<string>,
): Promise<{ ok: boolean; finalPath: string; skipped?: boolean }> {
  let lastStatus = 0;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`[static] retry ${attempt}/${MAX_RETRIES} for ${url}`);
      } else {
        console.log(`[static] downloading ${url}`);
      }
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), DOWNLOAD_TIMEOUT_MS);
      const res = await fetch(url, { signal: ctrl.signal, headers: buildHeaders(referer) });
      clearTimeout(t);

      if (!res.ok) {
        lastStatus = res.status;
        const isRetryableStatus = res.status >= 500 || res.status === 429;
        if (isRetryableStatus && attempt < MAX_RETRIES) {
          await sleep(calculateBackoff(attempt));
          continue;
        }

        console.error(`[static] download failed (status ${res.status}): ${url}`);
        return { ok: false, finalPath: destPath };
      }

      let final = destPath;
      if (destPath.endsWith(".bin")) {
        const inferred = inferExtFromContentType(res.headers.get("content-type"));
        if (inferred) {
          final = destPath.replace(/\.bin$/, inferred);
        }
      }

      if (existingFiles?.has(basename(final))) {
        console.log(`[static] skipped ${url} (already exists)`);
        return { ok: true, finalPath: final, skipped: true };
      }

      await mkdir(dirname(final), { recursive: true });
      await downloadStream(res, final);
      console.log(`[static] saved ${url} -> ${basename(final)}`);
      return { ok: true, finalPath: final };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (isRetryableError(err) && attempt < MAX_RETRIES) {
        await sleep(calculateBackoff(attempt));
        continue;
      }

      console.error(`[static] download error (${msg}): ${url}`);
      return { ok: false, finalPath: destPath };
    }
  }

  return { ok: false, finalPath: destPath };
}

export async function downloadMany(urls: string[], destDir: string, referer: string | null): Promise<Map<string, string>> {
  await mkdir(destDir, { recursive: true });
  const urlMap = new Map<string, string>();
  const queue = [...new Set(urls)];

  const used = new Set<string>();
  const fileOf = new Map<string, string>();
  for (const url of queue) {
    let name = generateStaticFilename(url);
    if (used.has(name)) {
      const base = name.replace(/\.[^.]+$/, "");
      const ext = extname(name);
      let c = 1;
      while (used.has(`${base}-${c}${ext}`)) {
        c += 1;
      }
      name = `${base}-${c}${ext}`;
    }
    used.add(name);
    fileOf.set(url, name);
  }

  let existingFiles = new Set<string>();
  try {
    existingFiles = new Set(await readdir(destDir));
  } catch {
    /* ignore */
  }

  let skipped = 0;
  let failed = 0;

  const globalSem = new Semaphore(MAX_TOTAL_CONCURRENT);
  const hostSemaphores = new Map<string, Semaphore>();

  function getHostSemaphore(host: string): Semaphore {
    let sem = hostSemaphores.get(host);
    if (!sem) {
      sem = new Semaphore(MAX_CONCURRENT_PER_HOST);
      hostSemaphores.set(host, sem);
    }
    return sem;
  }

  let idx = 0;
  async function worker() {
    while (true) {
      const i = idx;
      idx += 1;
      if (i >= queue.length) {
        break;
      }
      const url = queue[i];
      const name = fileOf.get(url)!;
      const dest = join(destDir, name);

      if (existingFiles.has(name)) {
        console.log(`[static] skipped ${url} (already exists)`);
        urlMap.set(url, name);
        skipped += 1;
        continue;
      }

      let host: string;
      try {
        host = new URL(url).hostname;
      } catch {
        failed += 1;
        continue;
      }

      await globalSem.acquire();
      const hostSem = getHostSemaphore(host);
      await hostSem.acquire();
      globalSem.release();

      try {
        const r = await downloadOne(url, dest, referer, existingFiles);
        if (r.ok) {
          urlMap.set(url, basename(r.finalPath));
          existingFiles.add(basename(r.finalPath));
          if (r.skipped) {
            skipped += 1;
          }
        } else {
          failed += 1;
        }
      } finally {
        hostSem.release();
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(MAX_TOTAL_CONCURRENT, queue.length) }, () => worker()));
  console.log(`[static] download summary: total=${queue.length}, skipped=${skipped}, failed=${failed}`);
  return urlMap;
}

function rewriteStaticUrls(obj: unknown, urlMap: Map<string, string>, prefix: string): unknown {
  if (obj === null) {
    return obj;
  }
  if (typeof obj === "string") {
    const t = obj.trim();
    if (urlMap.has(t)) {
      return `/${prefix}/${urlMap.get(t)}`;
    }
    if (obj.includes("<") && obj.includes(">")) {
      let s = obj;
      s = s.replace(/(\ssrc\s*=\s*["'])(https?:\/\/[^"']+)(["'])/gi, (_m, pre, url, suf) => {
        const mapped = urlMap.get(url);
        return mapped ? `${pre}/${prefix}/${mapped}${suf}` : _m;
      });
      s = s.replace(/(\ssrcset\s*=\s*["'])([^"']+)(["'])/gi, (_m, pre, srcset, suf) => {
        const parts = srcset.split(",").map((part: string) => {
          const tp = part.trim();
          const up = tp.split(/\s+/)[0];
          const desc = tp.slice(up.length);
          const mapped = urlMap.get(up);
          return mapped ? `/${prefix}/${mapped}${desc}` : tp;
        });
        return `${pre}${parts.join(", ")}${suf}`;
      });
      s = s.replace(/(\sposter\s*=\s*["'])(https?:\/\/[^"']+)(["'])/gi, (_m, pre, url, suf) => {
        const mapped = urlMap.get(url);
        return mapped ? `${pre}/${prefix}/${mapped}${suf}` : _m;
      });
      s = s.replace(/(\sdata-(?:src|original)\s*=\s*["'])(https?:\/\/[^"']+)(["'])/gi, (_m, pre, url, suf) => {
        const mapped = urlMap.get(url);
        return mapped ? `${pre}/${prefix}/${mapped}${suf}` : _m;
      });
      for (const [url, name] of urlMap) {
        s = s.split(url).join(`/${prefix}/${name}`);
      }
      return s;
    }
    let s = obj;
    for (const [url, name] of urlMap) {
      s = s.split(url).join(`/${prefix}/${name}`);
    }
    return s;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => rewriteStaticUrls(item, urlMap, prefix));
  }
  if (typeof obj !== "object") {
    return obj;
  }
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    result[k] = rewriteStaticUrls(v, urlMap, prefix);
  }
  return result;
}

async function findJsonFiles(dir: string): Promise<string[]> {
  const result: string[] = [];
  try {
    await stat(dir);
  } catch {
    return result;
  }
  for (const entry of await readdir(dir)) {
    if (SKIP_DIRS.has(entry)) {
      continue;
    }
    const full = join(dir, entry);
    const st = await stat(full);
    if (st.isDirectory()) {
      result.push(...(await findJsonFiles(full)));
    } else if (entry.endsWith(".json")) {
      result.push(full);
    }
  }
  return result;
}

async function resolveReferer(inputDir: string): Promise<string | null> {
  try {
    const path = join(inputDir, "site.config.json");
    await stat(path);
    const cfg = JSON.parse(await readFile(path, "utf-8"));
    const url = cfg?.site?.url;
    return typeof url === "string" && url.startsWith("http") ? url : null;
  } catch {
    return null;
  }
}

export async function transformStaticResources(inputDir: string, excludeHosts: string[] = []): Promise<void> {
  const referer = await resolveReferer(inputDir);
  if (referer) {
    console.log(`[static] referer: ${referer}`);
  }

  const jsonFiles = await findJsonFiles(inputDir);
  const allUrls = new Set<string>();
  for (const fp of jsonFiles) {
    try {
      const content = JSON.parse(await readFile(fp, "utf-8"));
      for (const u of extractStaticUrls(content)) {
        allUrls.add(u);
      }
    } catch {
      /* skip bad json */
    }
  }
  console.log(`[static] found ${jsonFiles.length} json file(s), ${allUrls.size} candidate url(s)`);

  let urls = Array.from(allUrls);
  if (excludeHosts.length > 0) {
    urls = urls.filter((u) => !isExcludedHost(u, excludeHosts));
  }
  console.log(`[static] ${urls.length} to download (${allUrls.size - urls.length} excluded by host)`);

  if (urls.length === 0) {
    return;
  }

  const prefix = "static-files";
  const staticDir = join(inputDir, "public", prefix);

  const urlMap = await downloadMany(urls, staticDir, referer);

  if (urlMap.size === 0) {
    return;
  }
  console.log(`[static] downloaded ${urlMap.size}/${urls.length}, rewriting ${jsonFiles.length} json file(s)`);

  for (const fp of jsonFiles) {
    try {
      const content = JSON.parse(await readFile(fp, "utf-8"));
      const rewritten = rewriteStaticUrls(content, urlMap, prefix);
      await writeFile(fp, JSON.stringify(rewritten, null, 2));
    } catch {
      /* skip bad json */
    }
  }
  console.log("[static] static resources transform done");
}
