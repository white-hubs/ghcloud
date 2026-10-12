import { HttpException } from "@dangao/bun-server";

import { buildBrowserFetchHeaders } from "./browser-profile";
import { type DnsResolver, resolveAndValidateHost } from "./dns-guard";
import { FetchBodyTooLargeError, FetchNetworkError, FetchRedirectError, FetchTimeoutError } from "./fetch-errors";
import { normalizeFetchUrl } from "./url-normalizer";

export interface FetchHttpOptions {
  url: string;
  timeoutMs: number;
  maxRedirects: number;
  userAgent: string;
  maxBodyBytes: number;
  resolver?: DnsResolver;
  fetchImpl?: typeof fetch;
  cookie?: string;
}

export interface FetchHttpResult {
  finalUrl: string;
  statusCode: number;
  statusText: string;
  contentType: string;
  arrayBuffer: ArrayBuffer;
  bytes: number;
  durationMs: number;
}

function isRedirectStatus(status: number): boolean {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

async function readBodyLimited(response: Response, maxBodyBytes: number): Promise<ArrayBuffer> {
  const reader = response.body?.getReader();
  if (!reader) {
    return new ArrayBuffer(0);
  }

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (!value) {
      continue;
    }
    total += value.byteLength;
    if (total > maxBodyBytes) {
      await reader.cancel();
      throw new FetchBodyTooLargeError(maxBodyBytes);
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return merged.buffer;
}

async function fetchValidatedOnce(targetUrl: URL, options: FetchHttpOptions, signal: AbortSignal): Promise<Response> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const hostname = targetUrl.hostname;
  await resolveAndValidateHost(hostname, options.resolver);

  const headers = buildBrowserFetchHeaders(options.userAgent);
  if (options.cookie && options.cookie.trim() !== "") {
    headers.set("Cookie", options.cookie);
  }

  return fetchImpl(targetUrl.toString(), {
    method: "GET",
    headers,
    redirect: "manual",
    signal,
  });
}

export async function fetchUrl(options: FetchHttpOptions): Promise<FetchHttpResult> {
  const startedAt = Date.now();
  let currentUrl = normalizeFetchUrl(options.url);
  let redirectCount = 0;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    while (true) {
      const response = await fetchValidatedOnce(currentUrl, options, controller.signal);

      if (isRedirectStatus(response.status)) {
        const location = response.headers.get("location");
        if (!location || location.trim() === "") {
          throw new FetchRedirectError("Redirect response missing Location header");
        }
        redirectCount += 1;
        if (redirectCount > options.maxRedirects) {
          throw new FetchRedirectError(`Too many redirects (max ${options.maxRedirects})`);
        }
        currentUrl = normalizeFetchUrl(new URL(location, currentUrl).toString());
        continue;
      }

      const arrayBuffer = await readBodyLimited(response, options.maxBodyBytes);
      return {
        finalUrl: currentUrl.toString(),
        statusCode: response.status,
        statusText: response.statusText,
        contentType: response.headers.get("content-type") ?? "",
        arrayBuffer,
        bytes: arrayBuffer.byteLength,
        durationMs: Date.now() - startedAt,
      };
    }
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new FetchTimeoutError(options.timeoutMs);
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new FetchTimeoutError(options.timeoutMs);
    }
    if (error instanceof Error) {
      throw new FetchNetworkError(error.message);
    }
    throw new FetchNetworkError("Unknown fetch error");
  } finally {
    clearTimeout(timeout);
  }
}
