import { afterEach, describe, expect, test } from "bun:test";

import { createSceneTypeMenu, updateSceneTypeMenu } from "../src/mdata.client";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const conflictResponse = (): Response =>
  new Response(
    JSON.stringify({
      status: 409,
      code: "",
      message: "存在场景类型信息！",
      details: "",
    }),
    { status: 409, headers: { "Content-Type": "application/json" } },
  );

describe("mdata scene type menu errors", () => {
  test("keeps an empty successful response compatible", async () => {
    globalThis.fetch = (async () => new Response(null, { status: 204 })) as unknown as typeof fetch;

    await expect(
      createSceneTypeMenu({
        projectId: "project-1",
        name: "正常菜单",
        parentId: null,
        sort: 1,
        scenarioType: "BUILD",
      }),
    ).resolves.toBeUndefined();
  });

  test("create rejects with the backend message on conflict", async () => {
    globalThis.fetch = (async () => conflictResponse()) as unknown as typeof fetch;

    await expect(
      createSceneTypeMenu({
        projectId: "project-1",
        name: "重复菜单",
        parentId: null,
        sort: 1,
        scenarioType: "BUILD",
      }),
    ).rejects.toThrow("存在场景类型信息！");
  });

  test("update rejects with the backend message on conflict", async () => {
    globalThis.fetch = (async () => conflictResponse()) as unknown as typeof fetch;

    await expect(
      updateSceneTypeMenu({
        id: "menu-1",
        projectId: "project-1",
        name: "重复菜单",
        parentId: null,
        sort: 1,
        scenarioType: "BUILD",
      }),
    ).rejects.toThrow("存在场景类型信息！");
  });
});
