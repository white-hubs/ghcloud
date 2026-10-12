import { APPLICATION_CODE } from "@/constants/env";

const GH_CURRENT_APP = "GH-currentApplication";
const GH_ENTERPRISE = "GH-NowEnterprise";

interface EnsureApplicationSessionContextOptions {
  tenantCode?: string | number;
  overwriteTenant?: boolean;
}

/** 补全 legacy 组件读取的应用码与租户码，供 `getAppAuthStore()`、表格列配置弹窗、文件上传等使用 */
export function ensureApplicationSessionContext(options: EnsureApplicationSessionContextOptions = {}): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  try {
    const mergeCode = (storageKey: string, fallbackCode?: string | number, overwrite = false): void => {
      if (fallbackCode === undefined || fallbackCode === null || String(fallbackCode).length === 0) {
        return;
      }
      const raw = sessionStorage.getItem(storageKey);
      const parsed = (raw ? JSON.parse(raw) : {}) as Record<string, unknown>;
      const code = parsed.code;
      if (overwrite || typeof code !== "string" || code.length === 0) {
        sessionStorage.setItem(storageKey, JSON.stringify({ ...parsed, code: String(fallbackCode) }));
      }
    };
    mergeCode(GH_CURRENT_APP, APPLICATION_CODE);
    mergeCode(GH_ENTERPRISE, options.tenantCode, options.overwriteTenant);
  } catch {
    sessionStorage.setItem(GH_CURRENT_APP, JSON.stringify({ code: APPLICATION_CODE }));
    if (options.tenantCode !== undefined && options.tenantCode !== null && String(options.tenantCode).length > 0) {
      sessionStorage.setItem(GH_ENTERPRISE, JSON.stringify({ code: String(options.tenantCode) }));
    }
  }
}
