/** 平台统一离线图标精灵的固定静态资源地址。 */
export const DEFAULT_CUBE_ICONFONT_URL = "/resource/cube-icon/iconfont.js";

const ICONFONT_SCRIPT_SELECTOR = "script[data-cube-iconfont]";
let loadingPromise: Promise<void> | undefined;

export interface LoadCubeIconfontOptions {
  /**
   * 图标精灵地址。默认使用平台公共静态资源；独立部署场景可按需覆盖。
   */
  scriptUrl?: string;
  /** 是否在请求中附带当前时间戳以绕过静态资源缓存。默认开启。 */
  cacheBust?: boolean;
}

function waitForScript(script: HTMLScriptElement): Promise<void> {
  if (script.dataset.cubeIconfontState === "loaded") {
    return Promise.resolve();
  }
  if (script.dataset.cubeIconfontState === "error") {
    return Promise.reject(new Error(`加载 Cube Iconfont 失败：${script.src}`));
  }

  return new Promise((resolve, reject) => {
    const handleLoad = (): void => {
      script.dataset.cubeIconfontState = "loaded";
      resolve();
    };
    const handleError = (): void => {
      script.dataset.cubeIconfontState = "error";
      reject(new Error(`加载 Cube Iconfont 失败：${script.src}`));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
  });
}

/**
 * 在当前文档中加载离线 iconfont.js。
 *
 * 下载文件会将 SVG Symbol 注入 document；微应用共享同一 document，因此使用
 * data 属性和模块内 Promise 双重去重，避免重复插入精灵。
 */
export function loadCubeIconfont(options: LoadCubeIconfontOptions = {}): Promise<void> {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return Promise.resolve();
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(ICONFONT_SCRIPT_SELECTOR);
  if (existingScript) {
    loadingPromise = waitForScript(existingScript);
    return loadingPromise;
  }

  const scriptUrl = options.scriptUrl ?? DEFAULT_CUBE_ICONFONT_URL;
  const resourceUrl = new URL(scriptUrl, window.location.href);
  if (options.cacheBust !== false) {
    resourceUrl.searchParams.set("t", String(Date.now()));
  }

  const script = document.createElement("script");
  script.dataset.cubeIconfont = "true";
  script.dataset.cubeIconfontState = "loading";
  script.src = resourceUrl.href;

  loadingPromise = waitForScript(script).catch((error: unknown) => {
    loadingPromise = undefined;
    script.remove();
    throw error;
  });
  document.head.appendChild(script);
  return loadingPromise;
}
