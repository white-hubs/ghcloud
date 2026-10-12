// oxlint-disable no-console
import qiniu from "qiniu";

export interface CdnRefreshResult {
  success: boolean;
  message?: string;
}

export interface CdnRefreshOptions {
  accessKey: string;
  secretKey: string;
  urls?: string[];
  dirs?: string[];
}

export async function refreshQiniuCdn(options: CdnRefreshOptions): Promise<CdnRefreshResult> {
  const { accessKey, secretKey, urls = [], dirs = [] } = options;

  if (!accessKey || !secretKey) {
    return { success: false, message: "Missing required params: accessKey, secretKey" };
  }

  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  const cdnManager = new (qiniu as any).cdn.CdnManager(mac);

  console.log(`[cdn] refresh request: urls=${urls.length}, dirs=${dirs.length}`);
  try {
    await new Promise<void>((resolve, reject) => {
      // 官方 SDK 中，refreshUrls/refreshDirs 内部传 null 而非 []
      const finalUrls = urls.length > 0 ? urls : null;
      const finalDirs = dirs.length > 0 ? dirs : null;
      cdnManager.refreshUrlsAndDirs(finalUrls, finalDirs, (err: any, respBody: any, respInfo: any) => {
        if (err) {
          reject(err);
          return;
        }
        const statusCode = respInfo?.statusCode;
        if (statusCode && statusCode !== 200) {
          reject(new Error(typeof respBody === "string" ? respBody : JSON.stringify(respBody)));
          return;
        }
        if (respBody && respBody.code && respBody.code !== 0) {
          reject(new Error(respBody.error || JSON.stringify(respBody)));
          return;
        }
        resolve();
      });
    });
    return { success: true };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : String(e) };
  }
}

export function normalizeDomainToBaseUrl(domain: string): string {
  const trimmed = domain.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withScheme.endsWith("/") ? withScheme : withScheme + "/";
}
