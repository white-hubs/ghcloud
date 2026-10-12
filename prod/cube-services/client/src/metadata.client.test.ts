import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { authRequest, DEV_MOCK_AUTH, useAuthRequest } from "./auth-request";
import { getAreaById } from "./metadata.client";

const originalFetch = globalThis.fetch;

beforeEach(() => {
  authRequest.updateAuth(DEV_MOCK_AUTH);
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("区域详情客户端", () => {
  test("请求现有主数据接口并保留楼层平面图与坐标系字段", async () => {
    const requests: Array<{ url: string; method: string | undefined }> = [];
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      requests.push({ url: String(input), method: init?.method });
      return new Response(JSON.stringify({
        data: {
          id: "area/1",
          areaExtend: {
            pictureFiles: [{ path: "/ordinary-picture.png" }],
            floorPlanFile: { id: "file-1", path: "/minio/mdata/floor.png" },
            coordinateAxis: '{"bottomLeft":{"x":0,"y":0},"topRight":{"x":21,"y":17.6}}',
          },
        },
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }) as typeof fetch;

    const detail = await useAuthRequest(() => getAreaById("area/1"));

    expect(requests).toEqual([{ url: "/api/mdata/area/area%2F1", method: "GET" }]);
    expect(detail.areaExtend?.floorPlanFile?.path).toBe("/minio/mdata/floor.png");
    expect(detail.areaExtend?.coordinateAxis).toBe('{"bottomLeft":{"x":0,"y":0},"topRight":{"x":21,"y":17.6}}');
  });

  test("兼容主数据接口直接返回区域详情", async () => {
    globalThis.fetch = (async () => new Response(JSON.stringify({ id: "area-2", areaExtend: { pictureFiles: [] } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as typeof fetch;

    await expect(useAuthRequest(() => getAreaById("area-2"))).resolves.toEqual({
      id: "area-2",
      areaExtend: { pictureFiles: [] },
    });
  });
});
