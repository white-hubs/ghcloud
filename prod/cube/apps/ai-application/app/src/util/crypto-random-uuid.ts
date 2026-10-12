/** RFC 4122 v4 UUID；在无 randomUUID 的环境（如 HTTP 非安全上下文）走 getRandomValues / Math.random 兜底 */
function randomUUIDFallback(): string {
  const bytes = new Uint8Array(16);
  const cryptoObj = globalThis.crypto;
  if (typeof cryptoObj?.getRandomValues === "function") {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function randomUUID(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return randomUUIDFallback();
}

/** 供 @cube-ai/agent-sdk-client 等在非 HTTPS 下使用；应在应用入口最早调用 */
export function ensureCryptoRandomUUIDPolyfill(): void {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return;
  }
  const root = globalThis as typeof globalThis & { crypto?: Crypto };
  if (!root.crypto) {
    root.crypto = {} as Crypto;
  }
  root.crypto.randomUUID = randomUUIDFallback;
}
