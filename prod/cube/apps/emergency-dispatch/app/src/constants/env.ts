/**
 * 应用码：优先 Vite `define` 注入的 `__ENV__`，否则回退到 `VITE_APPLICATION_CODE`。
 * `typeof __ENV__` 可在未注入时安全判断，避免 ReferenceError。
 */
interface AppEnv {
  applicationCode: string;
}

function loadAppEnv(): AppEnv {
  if (typeof __ENV__ !== "undefined") {
    if (typeof __ENV__ === "string") {
      return JSON.parse(__ENV__) as AppEnv;
    }
    return __ENV__;
  }
  return {
    applicationCode: import.meta.env.VITE_APPLICATION_CODE || "emergency-dispatch",
  };
}

export const APPLICATION_CODE: string = loadAppEnv().applicationCode;

/** qiankun 挂载路径段，与 main.ts base、vite projectName、index.html 挂载 id 保持一致 */
export const APP_ROUTE_PREFIX = "/portal/emergency-dispatch";
