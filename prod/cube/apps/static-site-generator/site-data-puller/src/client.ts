import type { PullConfig } from "./types.ts";
import { safeJsonParse } from "./utils/json.ts";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  params?: Record<string, string | number | undefined>;
  body?: unknown;
}

export class ApiClient {
  private readonly config: PullConfig;

  public constructor(config: PullConfig) {
    this.config = config;
  }

  private buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
    const base = this.config.baseUrl.replace(/\/$/, "");
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${base}${normalizedPath}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private buildHeaders(): Record<string, string> {
    return {
      "content-type": "application/json;charset=utf-8",
      tenant: this.config.tenant,
      terminal: this.config.terminal,
      authorization: `Bearer ${this.config.token}`,
    };
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async request<T>(options: RequestOptions): Promise<T> {
    const { method = "GET", path, params, body } = options;

    if (this.config.dryRun) {
      console.log(`[dry-run] ${method} ${this.buildUrl(path, params)}`);
      return {} as T;
    }

    const url = this.buildUrl(path, params);
    const init: RequestInit = {
      method,
      headers: this.buildHeaders(),
    };
    if (body !== undefined && method !== "GET") {
      init.body = JSON.stringify(body);
    }

    let lastError: Error | undefined;
    const maxRetries = 3;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(url, init);
        const text = await res.text();
        let data: unknown = null;
        if (text) {
          try {
            data = safeJsonParse(text);
          } catch {
            data = text;
          }
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
        }
        return data as T;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < maxRetries) {
          await this.sleep(this.config.rateLimitMs * (attempt + 1));
        }
      }
    }

    throw new Error(`[api] 请求失败 (${method} ${url}): ${lastError?.message}`);
  }
}
