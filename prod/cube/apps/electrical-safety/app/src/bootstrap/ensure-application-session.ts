import { APPLICATION_CODE } from "@/constants/env";

const GH_CURRENT_APP = "GH-currentApplication";
const GH_ENTERPRISE = "GH-NowEnterprise";

interface EnsureApplicationSessionContextOptions {
  tenantCode?: string | number;
}

/** 独立运行（非 qiankun）无主应用写入 session 时，补全应用码与租户码，供 Cube 表格等能力读取。 */
export function ensureApplicationSessionContext(options: EnsureApplicationSessionContextOptions = {}): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  try {
    const mergeCode = (storageKey: string, fallbackCode?: string | number): void => {
      if (fallbackCode === undefined || fallbackCode === null || String(fallbackCode).length === 0) {
        return;
      }
      const raw = sessionStorage.getItem(storageKey);
      const parsed = (raw ? JSON.parse(raw) : {}) as Record<string, unknown>;
      const code = parsed.code;
      if (typeof code !== "string" || code.length === 0) {
        sessionStorage.setItem(storageKey, JSON.stringify({ ...parsed, code: String(fallbackCode) }));
      }
    };
    mergeCode(GH_CURRENT_APP, APPLICATION_CODE);
    mergeCode(GH_ENTERPRISE, options.tenantCode);
  } catch {
    sessionStorage.setItem(GH_CURRENT_APP, JSON.stringify({ code: APPLICATION_CODE }));
    if (options.tenantCode !== undefined && options.tenantCode !== null && String(options.tenantCode).length > 0) {
      sessionStorage.setItem(GH_ENTERPRISE, JSON.stringify({ code: String(options.tenantCode) }));
    }
  }
}
