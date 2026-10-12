// oxlint-disable complexity
// oxlint-disable no-magic-numbers
// oxlint-disable prefer-template
// oxlint-disable typescript/no-explicit-any
// oxlint-disable no-console
import { readdir, stat, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import qiniu from "qiniu";

import type { ProviderConfig, Provider } from "../types";
import { refreshQiniuCdn, normalizeDomainToBaseUrl } from "../utils/qiniu-cdn";
import type { DeployProvider, DeployResult } from "./base";

export class QiniuProvider implements DeployProvider {
  readonly name: Provider = "qiniu";

  async deploy(config: ProviderConfig, localPath: string, onProgress: (progress: number) => void): Promise<DeployResult> {
    try {
      const { accessKey, secretKey, bucket, zone, domain: configDomain } = config;

      if (!accessKey || !secretKey || !bucket) {
        return { success: false, error: "Missing required config: accessKey, secretKey, bucket" };
      }

      const siteDomain = await this.resolveDomainFromSiteConfig(localPath);
      const domain = siteDomain || configDomain;
      if (siteDomain) {
        console.log(`[qiniu] domain from site.config: ${siteDomain}`);
      } else if (configDomain) {
        console.log(`[qiniu] domain from config: ${configDomain}`);
      }

      const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

      const cfg = new qiniu.conf.Config();
      if (zone) {
        const zoneName = "Zone_" + zone;
        if ((qiniu.zone as any)[zoneName]) {
          (cfg as any).zone = (qiniu.zone as any)[zoneName];
        }
      }

      const isDir = (await stat(localPath)).isDirectory();
      let output: string;
      let fileKey = "";
      let files: string[] = [];

      if (isDir) {
        files = await this.listFiles(localPath, localPath);
        const total = files.length;
        console.log(`[qiniu] uploading ${total} file(s) to bucket ${bucket}`);
        for (const f of files.slice(0, 10)) {
          console.log(`[qiniu]   - ${f.substring(localPath.length + 1).replace(/\\/g, "/")}`);
        }
        if (total > 10) {
          console.log(`[qiniu]   ... and ${total - 10} more`);
        }

        let uploaded = 0;
        let lastLoggedPct = 0;

        for (const file of files) {
          const relativePath = file.substring(localPath.length + 1);
          const key = relativePath.replace(/\\/g, "/");

          await this.uploadFile(cfg, mac, bucket, key, file);
          uploaded += 1;
          const pct = Math.round((uploaded / total) * 100);
          onProgress(pct);
          if (pct - lastLoggedPct >= 25 || uploaded === total) {
            console.log(`[qiniu] uploaded ${uploaded}/${total} (${pct}%)`);
            lastLoggedPct = pct;
          }
        }
        console.log(`[qiniu] upload complete: ${total} file(s)`);
        output = domain ? `https://${domain}/` : bucket;
      } else {
        fileKey = localPath.split("/").pop() || "index.html";
        await this.uploadFile(cfg, mac, bucket, fileKey, localPath);
        console.log(`[qiniu] uploaded single file ${fileKey}`);
        output = domain ? `https://${domain}/${fileKey}` : fileKey;
      }

      if (domain) {
        const baseUrl = normalizeDomainToBaseUrl(domain);
        const fileUrls = isDir ? [baseUrl, `${baseUrl}index.html`] : [`${baseUrl}${fileKey}`];

        console.log(`[qiniu] refreshing CDN: ${fileUrls.join(", ")}`);
        const refreshResult = await refreshQiniuCdn({ accessKey, secretKey, urls: fileUrls });
        if (refreshResult.success) {
          console.log("[qiniu] CDN refresh ok");
        } else {
          console.warn(`[qiniu] CDN refresh failed: ${refreshResult.message}`);
        }
      }

      console.log(`[qiniu] deploy output: ${output}`);
      return { success: true, output };
    } catch (error) {
      console.error(`[qiniu] deploy failed: ${error instanceof Error ? error.message : String(error)}`);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private uploadFile(cfg: qiniu.conf.Config, mac: qiniu.auth.digest.Mac, bucket: string, key: string, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const putPolicy = new qiniu.rs.PutPolicy({ scope: `${bucket}:${key}` });
      const uploadToken = putPolicy.uploadToken(mac);
      const uploader = new qiniu.form_up.FormUploader(cfg);
      const extra = new qiniu.form_up.PutExtra();
      uploader.putFile(uploadToken, key, filePath, extra, (err: any, ret: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async listFiles(dir: string, baseDir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await this.listFiles(fullPath, baseDir);
        files.push(...subFiles);
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  private async resolveDomainFromSiteConfig(localPath: string): Promise<string | null> {
    const candidates = [join(localPath, "site.config.json"), join(dirname(localPath), "input", "site.config.json")];
    for (const configPath of candidates) {
      try {
        const content = await readFile(configPath, "utf-8");
        const cfg = JSON.parse(content);
        const url = cfg?.site?.url;
        if (typeof url === "string" && url.startsWith("http")) {
          return new URL(url).hostname;
        }
      } catch {
        // continue to next candidate
      }
    }
    return null;
  }
}
