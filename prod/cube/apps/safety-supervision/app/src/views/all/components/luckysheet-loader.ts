type LuckysheetGlobal = Window & {
  luckysheet?: unknown;
  $?: unknown;
  jQuery?: unknown;
};

const LOCAL_EXCEL_ASSET_BASE_PATH = "/excle";
const RESOURCE_EXCEL_ASSET_BASE_PATH = "/resource/v1/safety-supervision/excle";
const BROKEN_HTML2CANVAS_LOGGER = "window.(function(){})";
const FIXED_HTML2CANVAS_LOGGER = "window.console.log";

let loadPromise: Promise<void> | undefined;

const getGlobal = (): LuckysheetGlobal => window as LuckysheetGlobal;

const syncJQueryGlobals = (): void => {
  const global = getGlobal();
  global.$ = global.$ ?? global.jQuery;
  global.jQuery = global.jQuery ?? global.$;
};

const getExcelAssetBasePaths = (): string[] => {
  const { hostname } = window.location;
  const isLocal = import.meta.env.DEV || hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
  return isLocal
    ? [LOCAL_EXCEL_ASSET_BASE_PATH, RESOURCE_EXCEL_ASSET_BASE_PATH]
    : [RESOURCE_EXCEL_ASSET_BASE_PATH, LOCAL_EXCEL_ASSET_BASE_PATH];
};

const loadScript = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-luckysheet-src="${src}"]`);
    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.luckysheetSrc = src;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.appendChild(script);
  });

const loadPatchedPluginScript = async (src: string): Promise<void> => {
  const existing = document.querySelector<HTMLScriptElement>(`script[data-luckysheet-src="${src}"]`);
  if (existing?.dataset.loaded === "true") {
    return;
  }

  const response = await fetch(src, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${src}`);
  }

  const script = document.createElement("script");
  script.dataset.luckysheetSrc = src;
  script.text = (await response.text()).replaceAll(BROKEN_HTML2CANVAS_LOGGER, FIXED_HTML2CANVAS_LOGGER);
  document.head.appendChild(script);
  script.dataset.loaded = "true";
};

const loadScriptFromBasePaths = async (relativePath: string, isReady: () => boolean): Promise<void> => {
  let lastError: unknown;
  for (const basePath of getExcelAssetBasePaths()) {
    try {
      await loadScript(`${basePath}${relativePath}`);
      if (isReady()) {
        return;
      }
      lastError = new Error(`${basePath}${relativePath} loaded without required globals`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`Failed to load ${relativePath}`);
};

const loadPatchedPluginScriptFromBasePaths = async (): Promise<void> => {
  let lastError: unknown;
  for (const basePath of getExcelAssetBasePaths()) {
    try {
      await loadPatchedPluginScript(`${basePath}/plugins/js/plugin.js`);
      syncJQueryGlobals();
      if (getGlobal().$ && getGlobal().jQuery) {
        return;
      }
      lastError = new Error(`${basePath}/plugins/js/plugin.js loaded without required globals`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Failed to load patched Luckysheet plugin");
};

export const loadLuckysheet = async (): Promise<void> => {
  const global = getGlobal();
  if (global.luckysheet && (global.$ || global.jQuery)) {
    syncJQueryGlobals();
    return;
  }

  loadPromise ??= (async () => {
    if (!global.$ && !global.jQuery) {
      await loadPatchedPluginScriptFromBasePaths();
    }
    syncJQueryGlobals();
    if (!global.$ || !global.jQuery) {
      throw new Error("Luckysheet plugin loaded without jQuery globals");
    }

    if (!global.luckysheet) {
      await loadScriptFromBasePaths("/luckysheet.umd.js", () => Boolean(global.luckysheet));
    }
    if (!global.luckysheet) {
      throw new Error("Luckysheet loaded without window.luckysheet");
    }
  })();

  await loadPromise;
};
