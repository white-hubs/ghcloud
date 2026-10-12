import { APPLICATION_CODE } from "@/constants/env";

const GH_CURRENT_APP = "GH-currentApplication";
const GH_ENTERPRISE = "GH-NowEnterprise";

/** 独立运行（非 qiankun）无主应用写入 session 时，补全应用码与租户码，供 `getAppAuthStore()`、表格列配置弹窗等使用 */
export function ensureApplicationSessionContext(): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  try {
    const mergeCode = (storageKey: string, fallbackCode: string): void => {
      const raw = sessionStorage.getItem(storageKey);
      const parsed = (raw ? JSON.parse(raw) : {}) as Record<string, unknown>;
      const code = parsed.code;
      if (typeof code !== "string" || code.length === 0) {
        sessionStorage.setItem(storageKey, JSON.stringify({ ...parsed, code: fallbackCode }));
      }
    };
    mergeCode(GH_CURRENT_APP, APPLICATION_CODE);
    mergeCode(GH_ENTERPRISE, "MOCK_TENANT");
  } catch {
    sessionStorage.setItem(GH_CURRENT_APP, JSON.stringify({ code: APPLICATION_CODE }));
    sessionStorage.setItem(GH_ENTERPRISE, JSON.stringify({ code: "MOCK_TENANT" }));
  }
}
