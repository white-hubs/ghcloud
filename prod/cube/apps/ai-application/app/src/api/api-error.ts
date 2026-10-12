import type { ServiceError } from "@ghcloud/cube-gateway";

/**
 * `AbstractServiceError`（`@ghcloud/cube-gateway`）继承 `Error` 但 `super()` 未传 message，
 * 真正的后端文案落在 `errorMessage` 上；直接 `String(error)` 只会拿到类名（如 "BadRequestServiceError"）。
 */
function isServiceErrorLike(error: unknown): error is ServiceError {
  return typeof error === "object" && error !== null && typeof (error as ServiceError).errorMessage === "string";
}

/** 从网关 ServiceError 提取后端 errorMessage 做兜底展示；非 ServiceError 时退回 Error.message / String(error)。 */
export function describeApiError(error: unknown): string {
  if (isServiceErrorLike(error) && error.errorMessage.trim()) {
    return error.errorMessage.trim();
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  return String(error);
}
