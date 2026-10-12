import iconv from "iconv-lite";

import type { ContentKind } from "../contracts/types";
import { htmlToText } from "./html-to-text";

const META_CHARSET_PATTERN = /<meta[^>]+charset\s*=\s*["']?\s*([^"'\s/>]+)/i;
const META_HTTP_EQUIV_PATTERN = /<meta[^>]+http-equiv\s*=\s*["']?content-type["']?[^>]+content\s*=\s*["'][^"']*charset\s*=\s*([^"'\s;]+)/i;

const CJK_CHARSETS = new Set(["gbk", "gb2312", "gb18030", "big5"]);

export function normalizeCharsetLabel(charset: string | undefined): string | undefined {
  if (!charset) {
    return undefined;
  }
  const normalized = charset.trim().toLowerCase().replace(/^"|"$/g, "");
  if (normalized === "") {
    return undefined;
  }
  if (normalized === "gb2312" || normalized === "gb_2312-80") {
    return "gbk";
  }
  return normalized;
}

export function isCjkCharset(charset: string): boolean {
  return CJK_CHARSETS.has(charset.toLowerCase());
}

export function detectCharsetFromContentType(contentType: string | null | undefined): string | undefined {
  if (!contentType) {
    return undefined;
  }
  const match = /charset=([^;\s]+)/i.exec(contentType);
  return normalizeCharsetLabel(match?.[1]);
}

export function detectCharsetFromHtmlSnippet(bytes: Uint8Array): string | undefined {
  const sampleLength = Math.min(bytes.byteLength, 4096);
  const sample = bytes.subarray(0, sampleLength);
  const ascii = Buffer.from(sample).toString("latin1");
  const direct = META_CHARSET_PATTERN.exec(ascii);
  if (direct?.[1]) {
    return normalizeCharsetLabel(direct[1]);
  }
  const httpEquiv = META_HTTP_EQUIV_PATTERN.exec(ascii);
  if (httpEquiv?.[1]) {
    return normalizeCharsetLabel(httpEquiv[1]);
  }
  return undefined;
}

export function detectCharset(contentType: string | null | undefined, arrayBuffer: ArrayBuffer): string | undefined {
  const fromHeader = detectCharsetFromContentType(contentType);
  if (fromHeader) {
    return fromHeader;
  }
  return detectCharsetFromHtmlSnippet(new Uint8Array(arrayBuffer));
}

function createDecoder(label: string): TextDecoder {
  return new TextDecoder(label as never, { fatal: true });
}

export function decodeResponseBody(arrayBuffer: ArrayBuffer, charset: string | undefined): string {
  const normalizedCharset = normalizeCharsetLabel(charset) ?? "utf-8";

  try {
    return createDecoder(normalizedCharset).decode(arrayBuffer);
  } catch {
    const nodeBuffer = Buffer.from(arrayBuffer);
    const fallbackCharset = isCjkCharset(normalizedCharset) ? normalizedCharset : "gbk";
    return iconv.decode(nodeBuffer, fallbackCharset);
  }
}

export function normalizeDecodedBody(body: string, contentType: string, contentKind?: ContentKind): string {
  const lowerType = contentType.toLowerCase();

  // claw-code：content-type 含 html → html_to_text
  if (lowerType.includes("html") || contentKind === "html") {
    return htmlToText(body);
  }

  // RSS/Atom/XML 标记语言：去标签为可读纯文本（claw-code 对 rss+xml 仅 trim 保留原始 XML；article 路径更易读）
  if (contentKind === "rss" || lowerType.includes("xml") || lowerType.includes("rss") || lowerType.includes("atom")) {
    return htmlToText(body);
  }

  return body.trim();
}

export function normalizeFetchedContent(
  arrayBuffer: ArrayBuffer,
  contentType: string | null | undefined,
  isHtml: boolean,
  htmlToText: (html: string) => string,
): string {
  const charset = detectCharset(contentType, arrayBuffer);
  const decoded = decodeResponseBody(arrayBuffer, charset);
  if (isHtml) {
    return htmlToText(decoded);
  }
  return decoded.trim();
}
