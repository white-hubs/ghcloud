/**
 * @cube-ai/agent-sdk-client auth.provider 契约：返回裸 JWT，由 SDK 统一加 `Bearer ` 前缀。
 * 直连 fetch（如预览图）请用 `buildAgenticEngineRequestHeaders`。
 */
export function resolveAgenticEngineAuthToken(token: string): string {
  return token.trim();
}
