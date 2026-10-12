import { describe, expect, test } from "bun:test";
import iconv from "iconv-lite";

import {
  decodeResponseBody,
  detectCharsetFromContentType,
  detectCharsetFromHtmlSnippet,
  normalizeCharsetLabel,
} from "../src/fetch-core/content-normalizer";

describe("content-normalizer", () => {
  test("normalizeCharsetLabel maps gb2312 to gbk", () => {
    expect(normalizeCharsetLabel("GB2312")).toBe("gbk");
  });

  test("detectCharsetFromContentType reads header charset", () => {
    expect(detectCharsetFromContentType("text/html; charset=gbk")).toBe("gbk");
  });

  test("detectCharsetFromHtmlSnippet reads meta charset", () => {
    const html = '<html><head><meta charset="gbk"></head><body></body></html>';
    const bytes = new TextEncoder().encode(html);
    expect(detectCharsetFromHtmlSnippet(bytes)).toBe("gbk");
  });

  test("decodeResponseBody decodes GBK bytes", () => {
    const text = "中文测试";
    const gbkBuffer = iconv.encode(text, "gbk");
    const arrayBuffer = gbkBuffer.buffer.slice(gbkBuffer.byteOffset, gbkBuffer.byteOffset + gbkBuffer.byteLength);
    expect(decodeResponseBody(arrayBuffer, "gbk")).toBe(text);
  });

  test("decodeResponseBody falls back to iconv when TextDecoder fails", () => {
    const original = TextDecoder;
    class BrokenDecoder {
      public decode(): string {
        throw new Error("decoder failed");
      }
    }

    // @ts-expect-error test override
    globalThis.TextDecoder = BrokenDecoder;

    try {
      const text = "兜底中文";
      const gbkBuffer = iconv.encode(text, "gbk");
      const arrayBuffer = gbkBuffer.buffer.slice(gbkBuffer.byteOffset, gbkBuffer.byteOffset + gbkBuffer.byteLength);
      expect(decodeResponseBody(arrayBuffer, "utf-8")).toBe(text);
    } finally {
      globalThis.TextDecoder = original;
    }
  });
});
