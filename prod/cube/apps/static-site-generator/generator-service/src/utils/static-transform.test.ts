import { createWriteStream } from "node:fs";
import { mkdir, writeFile, readdir } from "node:fs/promises";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { downloadOne, downloadMany, sleep, isExcludedHost, normalizeExcludeHosts, generateStaticFilename } from "./static-transform";

function mockReadableStream(data: Uint8Array) {
  let consumed = false;
  return {
    getReader: () => ({
      read: async () => {
        if (consumed) return { done: true, value: undefined };
        consumed = true;
        return { done: false, value: data };
      },
    }),
  };
}

function createMockWriteStream() {
  return {
    write: vi.fn(() => true),
    end: vi.fn(),
    once: vi.fn(),
    on: vi.fn((event: string, cb: () => void) => {
      if (event === "finish") cb();
      return this;
    }),
  };
}

vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  readdir: vi.fn(),
  readFile: vi.fn(),
  stat: vi.fn(),
}));
vi.mock("node:fs", () => ({
  createWriteStream: vi.fn(() => createMockWriteStream()),
}));

describe("downloadOne", () => {
  const url = "https://example.com/image.png";
  const destPath = "/tmp/static/image.png";
  const referer = "https://example.com";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);
    vi.mocked(readdir).mockResolvedValue([]);
    vi.spyOn(globalThis, "fetch").mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should succeed on first attempt", async () => {
    const buffer = new Uint8Array([1, 2, 3]);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        body: mockReadableStream(buffer),
        headers: { get: () => "image/png" },
      } as unknown as Response),
    );

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const result = await downloadOne(url, destPath, referer);
    expect(result.ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith("[static] downloading https://example.com/image.png");
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[static] saved https://example.com/image.png -> "));
    consoleSpy.mockRestore();
  });

  it("should retry on 504 and succeed on second attempt", async () => {
    const buffer = new Uint8Array([1, 2, 3]);
    let callCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: false,
            status: 504,
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          body: mockReadableStream(buffer),
          headers: { get: () => "image/png" },
        } as unknown as Response);
      }),
    );

    const sleepSpy = vi.spyOn(await import("./static-transform"), "sleep").mockResolvedValue(undefined);

    const result = await downloadOne(url, destPath, referer);
    expect(result.ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
    sleepSpy.mockRestore();
  });

  it("should fail after exhausting all retries on 504", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 504,
      } as Response),
    );

    const sleepSpy = vi.spyOn(await import("./static-transform"), "sleep").mockResolvedValue(undefined);

    const result = await downloadOne(url, destPath, referer);
    expect(result.ok).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(3);
    sleepSpy.mockRestore();
  });

  it("should retry on abort error and succeed on second attempt", async () => {
    const buffer = new Uint8Array([1, 2, 3]);
    let callCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          const err = new Error("The operation was aborted");
          err.name = "AbortError";
          return Promise.reject(err);
        }
        return Promise.resolve({
          ok: true,
          body: mockReadableStream(buffer),
          headers: { get: () => "image/png" },
        } as unknown as Response);
      }),
    );

    const sleepSpy = vi.spyOn(await import("./static-transform"), "sleep").mockResolvedValue(undefined);

    const result = await downloadOne(url, destPath, referer);
    expect(result.ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
    sleepSpy.mockRestore();
  });

  it("should not retry on 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      } as Response),
    );

    const result = await downloadOne(url, destPath, referer);
    expect(result.ok).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("downloadMany", () => {
  const referer = "https://example.com";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);
    vi.mocked(readdir).mockResolvedValue([]);
  });

  it("should download multiple URLs concurrently and map them", async () => {
    const urls = ["https://a.com/1.png", "https://a.com/2.png", "https://a.com/3.png"];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        body: mockReadableStream(new Uint8Array([1])),
        headers: { get: () => "image/png" },
      } as unknown as Response),
    );

    const map = await downloadMany(urls, "/tmp/static", referer);
    expect(map.size).toBe(3);
    for (const url of urls) {
      expect(map.has(url)).toBe(true);
    }
  });

  it("should skip existing files", async () => {
    const urls = ["https://a.com/1.png"];
    vi.mocked(readdir).mockResolvedValue([generateStaticFilename(urls[0])]);

    const map = await downloadMany(urls, "/tmp/static", referer);
    expect(map.size).toBe(1);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("should log skipped files", async () => {
    const urls = ["https://a.com/1.png"];
    vi.mocked(readdir).mockResolvedValue([generateStaticFilename(urls[0])]);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await downloadMany(urls, "/tmp/static", referer);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[static] skipped https://a.com/1.png (already exists)"));
    consoleSpy.mockRestore();
  });
});

describe("normalizeExcludeHosts", () => {
  it("normalizes an array of hosts", () => {
    expect(normalizeExcludeHosts([" Qiniu.xxx.com ", ".cdn.foo.com."])).toEqual(["qiniu.xxx.com", "cdn.foo.com"]);
  });

  it("splits a comma-separated string", () => {
    expect(normalizeExcludeHosts("qiniu.xxx.com, cdn.foo.com")).toEqual(["qiniu.xxx.com", "cdn.foo.com"]);
  });

  it("drops empty entries", () => {
    expect(normalizeExcludeHosts("qiniu.xxx.com,, ,")).toEqual(["qiniu.xxx.com"]);
  });

  it("returns [] for nullish or unsupported input", () => {
    expect(normalizeExcludeHosts(null)).toEqual([]);
    expect(normalizeExcludeHosts(undefined)).toEqual([]);
    expect(normalizeExcludeHosts(123)).toEqual([]);
  });
});

describe("isExcludedHost", () => {
  const suffixes = ["qiniu.xxx.com"];

  it("matches the exact host", () => {
    expect(isExcludedHost("https://qiniu.xxx.com/a.png", suffixes)).toBe(true);
  });

  it("matches a subdomain of the suffix", () => {
    expect(isExcludedHost("https://img.qiniu.xxx.com/a.png", suffixes)).toBe(true);
  });

  it("does not match a host that merely ends with the same characters", () => {
    expect(isExcludedHost("https://evilqiniu.xxx.com/a.png", suffixes)).toBe(false);
  });

  it("does not match an unrelated host", () => {
    expect(isExcludedHost("https://other.com/a.png", suffixes)).toBe(false);
  });

  it("returns false for an empty suffix list", () => {
    expect(isExcludedHost("https://qiniu.xxx.com/a.png", [])).toBe(false);
  });

  it("returns false for an invalid url", () => {
    expect(isExcludedHost("not a url", suffixes)).toBe(false);
  });
});
