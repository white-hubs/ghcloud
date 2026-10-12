// oxlint-disable no-magic-numbers
// oxlint-disable no-shadow
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockUploadFile, mockRefreshUrls, mockRefreshUrlsAndDirs, mockPutPolicy } = vi.hoisted(() => {
  const mockPutPolicy = vi.fn();
  const mockUploadFile = vi.fn().mockImplementation((_token, _key, _filePath, _extra, callback) => {
    callback(null, { hash: "mock-hash" });
    return { aborted: false };
  });

  const mockRefreshUrls = vi.fn().mockImplementation((_urls, callback) => {
    callback(null, "{}", { statusCode: 200 });
  });

  const mockRefreshUrlsAndDirs = vi.fn().mockImplementation((_urls, _dirs, callback) => {
    callback(null, "{}", { statusCode: 200 });
  });

  return { mockUploadFile, mockRefreshUrls, mockRefreshUrlsAndDirs, mockPutPolicy };
});

vi.mock("qiniu", () => ({
  default: {
    auth: {
      digest: {
        Mac: vi.fn().mockImplementation(() => ({
          accessKey: "mock-access-key",
          secretKey: "mock-secret-key",
        })),
      },
    },
    rs: {
      PutPolicy: vi.fn().mockImplementation((options) => {
        mockPutPolicy(options);
        return {
          uploadToken: vi.fn().mockReturnValue("mock-token"),
        };
      }),
    },
    conf: {
      Config: vi.fn().mockImplementation(() => ({})),
    },
    zone: {
      Zone_z0: {},
      Zone_z1: {},
      Zone_z2: {},
    },
    cdn: {
      CdnManager: vi.fn().mockImplementation(() => ({
        refreshUrls: mockRefreshUrls,
        refreshDirs: vi.fn(),
        refreshUrlsAndDirs: mockRefreshUrlsAndDirs,
      })),
      refreshUrls: mockRefreshUrls,
      refreshDirs: vi.fn(),
      refreshUrlsAndDirs: mockRefreshUrlsAndDirs,
    },
    form_up: {
      FormUploader: vi.fn().mockImplementation(() => ({
        putFile: mockUploadFile,
      })),
      PutExtra: vi.fn().mockImplementation(() => ({})),
    },
  },
}));

vi.mock("node:fs/promises", () => ({
  readdir: vi.fn().mockImplementation((path: string) => {
    if (path === "/tmp/dir") {
      return Promise.resolve(
        Array.from({ length: 11 }).map((_, i) => ({
          name: `d${i + 1}`,
          isDirectory: () => true,
          isFile: () => false,
        })),
      );
    }
    return Promise.resolve([]);
  }),
  stat: vi.fn().mockImplementation((path: string) => {
    if (path.includes("dir")) {
      return Promise.resolve({ isDirectory: () => true, isFile: () => false });
    }
    return Promise.resolve({ isDirectory: () => false, isFile: () => true });
  }),
  readFile: vi.fn().mockImplementation((path: string) => {
    if (path.endsWith("site.config.json")) {
      return Promise.resolve(JSON.stringify({ site: { url: "https://cdn.example.com" } }));
    }
    return Promise.resolve("");
  }),
}));

import { QiniuProvider } from "./qiniu";

describe("QiniuProvider", () => {
  let provider: QiniuProvider;
  const onProgress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new QiniuProvider();
  });

  describe("constructor", () => {
    it("should have name as qiniu", () => {
      expect(provider.name).toBe("qiniu");
    });
  });

  describe("deploy", () => {
    it("should return error when missing required config", async () => {
      const result = await provider.deploy({}, "/tmp/path", onProgress);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Missing required config: accessKey, secretKey, bucket");
    });

    it("should deploy file successfully", async () => {
      const config = {
        accessKey: "ak",
        secretKey: "sk",
        bucket: "test-bucket",
        domain: "cdn.example.com",
      };

      const result = await provider.deploy(config, "/tmp/test.tar.gz", onProgress);

      expect(result.success).toBe(true);
      expect(result.output).toContain("cdn.example.com");
      expect(mockPutPolicy).toHaveBeenCalledWith({ scope: "test-bucket:test.tar.gz" });
      expect(mockRefreshUrlsAndDirs).toHaveBeenCalledTimes(1);
      expect(mockRefreshUrlsAndDirs.mock.calls[0]?.[0]).toEqual(["https://cdn.example.com/test.tar.gz"]);
      expect(mockRefreshUrlsAndDirs.mock.calls[0]?.[1]).toBeNull();
    });

    it("should refresh urls when deploying a directory", async () => {
      const config = {
        accessKey: "ak",
        secretKey: "sk",
        bucket: "test-bucket",
        domain: "cdn.example.com",
      };

      const result = await provider.deploy(config, "/tmp/dir", onProgress);

      expect(result.success).toBe(true);
      expect(mockRefreshUrlsAndDirs).toHaveBeenCalledTimes(1);
      expect(mockRefreshUrlsAndDirs.mock.calls[0]?.[0]).toEqual(["https://cdn.example.com/", "https://cdn.example.com/index.html"]);
      expect(mockRefreshUrlsAndDirs.mock.calls[0]?.[1]).toBeNull();
    });

    it("should not fail deploy when cdn refresh fails", async () => {
      mockRefreshUrlsAndDirs.mockImplementationOnce((_urls, _dirs, callback) => {
        callback(new Error("refresh failed"), null, null);
      });

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

      const config = {
        accessKey: "ak",
        secretKey: "sk",
        bucket: "test-bucket",
        domain: "cdn.example.com",
      };

      const result = await provider.deploy(config, "/tmp/dir", onProgress);

      expect(result.success).toBe(true);
      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it("should return error when upload fails", async () => {
      mockUploadFile.mockImplementationOnce((_token, _key, _filePath, _extra, callback) => {
        callback(new Error("Upload failed"), null);
      });

      const config = {
        accessKey: "ak",
        secretKey: "sk",
        bucket: "test-bucket",
      };

      const result = await provider.deploy(config, "/tmp/test.tar.gz", onProgress);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Upload failed");
    });
  });
});
