import type { PullConfig } from "./types.ts";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`[config] 缺少必填环境变量: ${name}`);
    process.exit(1);
  }
  return value;
}

function getEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

function getEnvNumber(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (!raw) return defaultValue;
  const num = Number(raw);
  if (Number.isNaN(num) || num <= 0) {
    console.error(`[config] 环境变量 ${name} 必须是正整数，当前值: ${raw}`);
    process.exit(1);
  }
  return num;
}

export function loadConfig(): PullConfig {
  const dryRun = process.env.SSG_DRY_RUN === "1";

  const config: PullConfig = {
    baseUrl: requireEnv("SSG_API_BASE_URL"),
    token: requireEnv("SSG_API_TOKEN"),
    tenant: requireEnv("SSG_API_TENANT"),
    terminal: getEnv("SSG_API_TERMINAL", "bimops-manage-web"),
    outputDir: getEnv("SSG_OUTPUT_DIR", "./dist"),
    siteDirName:
      process.env.SSG_SITE_DIR_NAME ??
      `site-${new Date()
        .toISOString()
        .replace(/[-:T.Z]/g, "")
        .slice(0, 14)}`,
    pageSize: getEnvNumber("SSG_PAGE_SIZE", 100),
    rateLimitMs: getEnvNumber("SSG_RATE_LIMIT_MS", 150),
    dryRun,
  };

  if (dryRun) {
    console.log("[config] DRY RUN 模式，不会真正调用接口");
  }

  return config;
}
