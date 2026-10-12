import { createWriteStream } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { downloadFile } from "./download";

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

vi.mock("node:fs/promises");
vi.mock("node:fs", () => ({
  createWriteStream: vi.fn(() => createMockWriteStream()),
}));

describe("downloadFile", () => {
  const testDir = "/tmp/test-download";
  const testUrl = "https://example.com/test.tar.gz";
  const destPath = join(testDir, "test.tar.gz");

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(mkdir).mockResolvedValue(undefined);
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {}
  });

  it("should create directory if it does not exist", async () => {
    const mockResponse = {
      ok: true,
      body: mockReadableStream(new Uint8Array(10)),
    } as unknown as Response;

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    await downloadFile(testUrl, destPath);

    expect(mkdir).toHaveBeenCalledWith(testDir, { recursive: true });
  });

  it("should throw error when response is not ok", async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as unknown as Response;

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    await expect(downloadFile(testUrl, destPath)).rejects.toThrow("Failed to download https://example.com/test.tar.gz: 404 Not Found");
  });

  it("should call fetch with correct url and headers", async () => {
    const mockResponse = {
      ok: true,
      body: mockReadableStream(new Uint8Array(10)),
    } as unknown as Response;

    const mockFetch = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal("fetch", mockFetch);

    const customHeaders = { Authorization: "Bearer token" };
    await downloadFile(testUrl, destPath, customHeaders);

    expect(mockFetch).toHaveBeenCalledWith(testUrl, { headers: customHeaders });
  });

  it("should stream chunks to file", async () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5]);
    const mockResponse = {
      ok: true,
      body: mockReadableStream(buffer),
    } as unknown as Response;

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    await downloadFile(testUrl, destPath);

    const stream = vi.mocked(createWriteStream).mock.results[0]?.value;
    expect(stream.write).toHaveBeenCalledWith(buffer);
  });
});
