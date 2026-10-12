const DEFAULT_AI_CENTER_API_BASE = "/api/ai-center";
const ABSOLUTE_URL_RE = /^[a-z][a-z\d+\-.]*:\/\//i;

export interface AiCenterApiBaseRuntime {
  poweredByQiankun?: boolean;
  publicPath?: string;
  importMetaUrl?: string;
  locationHref?: string;
}

function readConfiguredBase(): string | undefined {
  return (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_AI_CENTER_API_BASE;
}

function readRuntime(): AiCenterApiBaseRuntime {
  const win =
    typeof window === "undefined"
      ? undefined
      : (window as Window & {
          __POWERED_BY_QIANKUN__?: boolean;
          __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string;
        });

  return {
    ...(win?.__POWERED_BY_QIANKUN__ === undefined ? {} : { poweredByQiankun: win.__POWERED_BY_QIANKUN__ }),
    ...(win?.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ === undefined ? {} : { publicPath: win.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ }),
    importMetaUrl: import.meta.url,
    ...(win?.location.href === undefined ? {} : { locationHref: win.location.href }),
  };
}

function normalizeBase(value: string): string {
  const base = value.trim().replace(/\/+$/, "");
  if (base === "") {
    return DEFAULT_AI_CENTER_API_BASE;
  }
  if (ABSOLUTE_URL_RE.test(base) || base.startsWith("/")) {
    return base;
  }
  return `/${base}`;
}

function resolveOrigin(candidate: string | undefined, locationHref: string): string | null {
  if (candidate == null || candidate.trim() === "") {
    return null;
  }
  try {
    const url = new URL(candidate, locationHref);
    return url.origin === "null" ? null : url.origin;
  } catch {
    return null;
  }
}

function resolveQiankunOrigin(runtime: AiCenterApiBaseRuntime): string | null {
  if (runtime.poweredByQiankun !== true) {
    return null;
  }

  const locationHref = runtime.locationHref ?? "http://localhost/";
  return resolveOrigin(runtime.publicPath, locationHref) ?? resolveOrigin(runtime.importMetaUrl, locationHref);
}

export function resolveAiCenterApiBase(
  configuredBase: string | undefined = readConfiguredBase(),
  runtime: AiCenterApiBaseRuntime = readRuntime(),
): string {
  const base = normalizeBase(configuredBase == null || configuredBase.trim() === "" ? DEFAULT_AI_CENTER_API_BASE : configuredBase);

  if (ABSOLUTE_URL_RE.test(base)) {
    return base;
  }

  const qiankunOrigin = resolveQiankunOrigin(runtime);
  if (qiankunOrigin != null && base.startsWith("/")) {
    return `${qiankunOrigin}${base}`;
  }

  return base;
}

export function resolveAgenticEngineBase(): string {
  return `${resolveAiCenterApiBase()}/agent`;
}
