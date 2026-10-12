import { describe, it, expect, vi } from "vitest";

const { mockRefreshUrlsAndDirs } = vi.hoisted(() => {
  const mockRefreshUrlsAndDirs = vi.fn().mockImplementation((_urls: any, _dirs: any, callback: any) => {
    callback(null, "{}", { statusCode: 200 });
  });
  return { mockRefreshUrlsAndDirs };
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
    cdn: {
      CdnManager: vi.fn().mockImplementation(() => ({
        refreshUrlsAndDirs: mockRefreshUrlsAndDirs,
      })),
      refreshUrlsAndDirs: mockRefreshUrlsAndDirs,
    },
  },
}));

import { createQiniuRoutes } from "./qiniu";

describe("POST /qiniu/refresh", () => {
  const router = { routes: [] as any[] };
  createQiniuRoutes(router);
  const route = router.routes.find((r) => r.path === "/qiniu/refresh");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when missing accessKey or secretKey", async () => {
    const req = new Request("http://localhost/qiniu/refresh", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await route.handler(req, new URL("http://localhost/qiniu/refresh"));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it("should refresh by domain", async () => {
    const req = new Request("http://localhost/qiniu/refresh", {
      method: "POST",
      body: JSON.stringify({
        accessKey: "ak",
        secretKey: "sk",
        domain: "example.com",
      }),
    });
    const res = await route.handler(req, new URL("http://localhost/qiniu/refresh"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockRefreshUrlsAndDirs).toHaveBeenCalledTimes(1);
    expect(mockRefreshUrlsAndDirs.mock.calls[0]?.[0]).toEqual(["https://example.com/", "https://example.com/index.html"]);
    expect(mockRefreshUrlsAndDirs.mock.calls[0]?.[1]).toEqual(["https://example.com/"]);
  });

  it("should refresh custom urls and dirs", async () => {
    const req = new Request("http://localhost/qiniu/refresh", {
      method: "POST",
      body: JSON.stringify({
        accessKey: "ak",
        secretKey: "sk",
        urls: ["https://example.com/a.html"],
        dirs: ["https://example.com/dir/"],
      }),
    });
    const res = await route.handler(req, new URL("http://localhost/qiniu/refresh"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockRefreshUrlsAndDirs.mock.calls[0]?.[0]).toEqual(["https://example.com/a.html"]);
    expect(mockRefreshUrlsAndDirs.mock.calls[0]?.[1]).toEqual(["https://example.com/dir/"]);
  });
});
