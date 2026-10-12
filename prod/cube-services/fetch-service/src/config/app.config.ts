/**
 * 应用配置
 */
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { DEFAULT_BROWSER_USER_AGENT } from "../fetch-core/browser-profile";

export interface AppConfig {
  port: number;
  hostname?: string;
  logLevel?: "debug" | "info" | "warn" | "error";
  fetchServiceToken?: string;
  defaultTimeoutMs: number;
  maxTimeoutMs: number;
  defaultMaxRedirects: number;
  maxRedirects: number;
  defaultUserAgent: string;
  maxLimit: number;
  maxBodyBytes: number;
  maxRequestBodyBytes: number;
  mcpHttpEnabled: boolean;
  mcpPath: string;
  defaultMcpLimit: number;
}

function getCliArg(name: string): string | undefined {
  const argv = (typeof Bun !== "undefined" ? Bun.argv : process.argv).slice(2).map((v) => String(v ?? ""));

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg) {
      continue;
    }
    if (arg.startsWith(`--${name}=`)) {
      return arg.substring(name.length + 3);
    }
    if (arg === `--${name}` && i + 1 < argv.length) {
      return argv[i + 1];
    }
  }
  return undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string" && value !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function readInteger(value: unknown): number | undefined {
  const parsed = readNumber(value);
  return parsed !== undefined && Number.isInteger(parsed) ? parsed : undefined;
}

function readPositiveInteger(value: unknown): number | undefined {
  const parsed = readInteger(value);
  return parsed !== undefined && parsed > 0 ? parsed : undefined;
}

function readNonNegativeInteger(value: unknown): number | undefined {
  const parsed = readInteger(value);
  return parsed !== undefined && parsed >= 0 ? parsed : undefined;
}

function readBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return undefined;
}

function readLogLevel(value: unknown): AppConfig["logLevel"] | undefined {
  return value === "debug" || value === "info" || value === "warn" || value === "error" ? value : undefined;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getDefaultAppConfigPath(): string {
  return fileURLToPath(new URL("../../config/app.json", import.meta.url));
}

export function resolveAppConfigPath(configPath?: string): string {
  if (!configPath) {
    return getDefaultAppConfigPath();
  }
  return isAbsolute(configPath) ? configPath : resolve(process.cwd(), configPath);
}

function loadAppJsonConfig(): Partial<AppConfig> {
  const configPath = getCliArg("config") ?? process.env.APP_CONFIG_PATH;
  const resolvedPath = resolveAppConfigPath(configPath);

  if (!existsSync(resolvedPath)) {
    return {};
  }

  try {
    const parsed = JSON.parse(readFileSync(resolvedPath, "utf8")) as Record<string, unknown>;
    const nestedApp = isPlainObject(parsed.app) ? parsed.app : {};
    const source = { ...parsed, ...nestedApp };
    return {
      port: readNumber(source.port),
      hostname: readString(source.hostname),
      logLevel: readLogLevel(source.logLevel),
      fetchServiceToken: readString(source.fetchServiceToken),
      defaultTimeoutMs: readNumber(source.defaultTimeoutMs),
      maxTimeoutMs: readNumber(source.maxTimeoutMs),
      defaultMaxRedirects: readNumber(source.defaultMaxRedirects),
      maxRedirects: readNumber(source.maxRedirects),
      defaultUserAgent: readString(source.defaultUserAgent),
      maxLimit: readNumber(source.maxLimit),
      maxBodyBytes: readNumber(source.maxBodyBytes),
      maxRequestBodyBytes: readNumber(source.maxRequestBodyBytes),
      mcpHttpEnabled: readBoolean(source.mcpHttpEnabled),
      mcpPath: readString(source.mcpPath),
      defaultMcpLimit: readNumber(source.defaultMcpLimit),
    };
  } catch {
    return {};
  }
}

export function loadAppConfig(): AppConfig {
  const appJsonConfig = loadAppJsonConfig();
  const cliPort = getCliArg("port");
  const cliHostname = getCliArg("hostname");
  const cliLogLevel = getCliArg("log-level");
  const cliToken = getCliArg("fetch-service-token");
  const maxTimeoutMs = readPositiveInteger(process.env.MAX_TIMEOUT_MS) ?? readPositiveInteger(appJsonConfig.maxTimeoutMs) ?? 60_000;
  const maxRedirects = readNonNegativeInteger(process.env.MAX_REDIRECTS) ?? readNonNegativeInteger(appJsonConfig.maxRedirects) ?? 10;
  const defaultTimeoutMs = Math.min(
    readPositiveInteger(process.env.DEFAULT_TIMEOUT_MS) ?? readPositiveInteger(appJsonConfig.defaultTimeoutMs) ?? 20_000,
    maxTimeoutMs,
  );
  const defaultMaxRedirects = Math.min(
    readNonNegativeInteger(process.env.DEFAULT_MAX_REDIRECTS) ?? readNonNegativeInteger(appJsonConfig.defaultMaxRedirects) ?? 10,
    maxRedirects,
  );

  return {
    port: parseInt(cliPort ?? process.env.PORT ?? String(appJsonConfig.port ?? "30210"), 10),
    hostname: cliHostname ?? process.env.HOSTNAME ?? appJsonConfig.hostname ?? "0.0.0.0",
    logLevel:
      (cliLogLevel as AppConfig["logLevel"]) ?? (process.env.LOG_LEVEL as AppConfig["logLevel"]) ?? appJsonConfig.logLevel ?? "info",
    fetchServiceToken: cliToken ?? process.env.FETCH_SERVICE_TOKEN ?? appJsonConfig.fetchServiceToken ?? "",
    defaultTimeoutMs,
    maxTimeoutMs,
    defaultMaxRedirects,
    maxRedirects,
    defaultUserAgent: process.env.DEFAULT_USER_AGENT ?? appJsonConfig.defaultUserAgent ?? DEFAULT_BROWSER_USER_AGENT,
    maxLimit: readPositiveInteger(process.env.MAX_LIMIT) ?? readPositiveInteger(appJsonConfig.maxLimit) ?? 200,
    maxBodyBytes: readPositiveInteger(process.env.MAX_BODY_BYTES) ?? readPositiveInteger(appJsonConfig.maxBodyBytes) ?? 5_242_880,
    maxRequestBodyBytes:
      readPositiveInteger(process.env.MAX_REQUEST_BODY_BYTES) ?? readPositiveInteger(appJsonConfig.maxRequestBodyBytes) ?? 65_536,
    mcpHttpEnabled: readBoolean(process.env.MCP_HTTP_ENABLED) ?? readBoolean(appJsonConfig.mcpHttpEnabled) ?? true,
    mcpPath: process.env.MCP_PATH ?? appJsonConfig.mcpPath ?? "/mcp",
    defaultMcpLimit: readPositiveInteger(process.env.DEFAULT_MCP_LIMIT) ?? readPositiveInteger(appJsonConfig.defaultMcpLimit) ?? 10,
  };
}
