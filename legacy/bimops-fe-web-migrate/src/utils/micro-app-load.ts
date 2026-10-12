import { logger } from "../logger.js";

const QIANKUN_LOAD_FAILURE_PATTERNS = [
  "died in status LOADING_SOURCE_CODE",
  "died in status LOADING",
  "died in status MOUNT",
  "died in status SKIP_BECAUSE_BROKEN",
] as const;

export const MICRO_APP_LOAD_TIMEOUT_MS = 30_000;
export const MICRO_APP_ERROR_GRACE_MS = 400;

export type MicroAppLoadPhase = "beforeLoad" | "beforeMount" | "afterMount" | "loadError" | "loadTimeout";

export function extractMicroAppErrorMessage(event: Event | string): string {
  if (typeof event === "string") {
    return event;
  }
  if (event instanceof ErrorEvent) {
    return event.message ?? String(event.error ?? "");
  }
  const rejection = event as PromiseRejectionEvent;
  const reason = rejection.reason;
  if (reason instanceof Error) {
    return reason.message;
  }
  return String(reason ?? "");
}

/** 仅识别 qiankun / single-spa 子应用加载失败，避免业务运行时错误误判。 */
export function isMicroAppLoadError(event: Event | string): boolean {
  const message = extractMicroAppErrorMessage(event);
  if (!message) {
    return false;
  }
  return QIANKUN_LOAD_FAILURE_PATTERNS.some((pattern) => message.includes(pattern));
}

export function logMicroAppLoad(phase: MicroAppLoadPhase, detail: Record<string, unknown>): void {
  logger.info("[micro-app-load]", { phase, ...detail });
}
