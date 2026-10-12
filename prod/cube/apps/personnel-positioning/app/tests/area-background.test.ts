import { describe, expect, test } from "bun:test";
import { computed, effectScope, nextTick, ref } from "vue";

import type { ApiPositioningArea } from "../src/api/positioning";
import { OUTDOOR_SCENE_ID } from "../src/constants/realtime";
import { useAreaBackground } from "../src/hooks/use-area-background";
import type { SystemAreaNode } from "../src/utils/system-areas";

type AreaDetail = Pick<ApiPositioningArea, "id" | "floorId" | "floorPlanFile" | "coordinateAxis">;

const axis = JSON.stringify({ bottomLeft: { x: 0, y: 0 }, topRight: { x: 21, y: 17.6 } });

function node(id: string): SystemAreaNode {
  return { key: id, title: id, path: id, ancestorIds: [], children: [] };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

describe("实时定位区域图片", () => {
  test("按区域 ID 获取楼层平面图和坐标系，快速切换时旧请求不能覆盖新区域", async () => {
    const sceneId = ref(OUTDOOR_SCENE_ID);
    const byId = computed(
      () =>
        new Map([
          ["area-a", node("area-a")],
          ["area-b", node("area-b")],
        ]),
    );
    const requests = new Map<string, ReturnType<typeof deferred<AreaDetail>>>();
    const requestedIds: string[] = [];
    const scope = effectScope();
    const background = scope.run(() =>
      useAreaBackground(sceneId, byId, (id) => {
        requestedIds.push(id);
        const request = deferred<AreaDetail>();
        requests.set(id, request);
        return request.promise;
      }),
    )!;

    expect(requestedIds).toEqual([]);
    sceneId.value = "area-a";
    await nextTick();
    expect(requestedIds).toEqual(["area-a"]);
    expect(background.loading.value).toBe(true);

    sceneId.value = "area-b";
    requests.get("area-a")!.resolve({ id: "area-a", floorId: "7", floorPlanFile: { id: "old", path: "/old.png" }, coordinateAxis: axis });
    await Promise.resolve();
    expect(background.url.value).toBe("");
    expect(background.axis.value).toBeNull();
    expect(background.floorId.value).toBe("");
    expect(background.loadedId.value).toBe("");
    await nextTick();
    expect(background.url.value).toBe("");

    requests.get("area-b")!.resolve({
      id: "area-b",
      floorId: "8",
      floorPlanFile: { id: "floor-plan", path: " /floor-plan.png " },
      coordinateAxis: axis,
    });
    await nextTick();
    expect(requestedIds).toEqual(["area-a", "area-b"]);
    expect(background.url.value).toBe("/floor-plan.png");
    expect(background.axis.value).toEqual({ bottomLeft: { x: 0, y: 0 }, topRight: { x: 21, y: 17.6 } });
    expect(background.floorId.value).toBe("8");
    expect(background.loadedId.value).toBe("area-b");
    expect(background.loading.value).toBe(false);
    scope.stop();
  });

  test("无平面图、请求失败和切回室外时清空区域背景及坐标系", async () => {
    const sceneId = ref("area-a");
    const byId = computed(
      () =>
        new Map([
          ["area-a", node("area-a")],
          ["area-b", node("area-b")],
        ]),
    );
    const scope = effectScope();
    const background = scope.run(() =>
      useAreaBackground(sceneId, byId, async (id) => {
        if (id === "area-a") return { id, floorId: "7", coordinateAxis: axis };
        throw new Error("request failed");
      }),
    )!;
    await nextTick();
    expect(background.url.value).toBe("");
    expect(background.axis.value).toBeNull();
    expect(background.floorId.value).toBe("7");
    expect(background.error.value).toBe("");

    sceneId.value = "area-b";
    await nextTick();
    expect(background.error.value).toBe("楼层平面图加载失败，请重试");
    expect(background.axis.value).toBeNull();
    expect(background.floorId.value).toBe("");

    sceneId.value = OUTDOOR_SCENE_ID;
    await nextTick();
    expect(background.url.value).toBe("");
    expect(background.axis.value).toBeNull();
    expect(background.loadedId.value).toBe("");
    expect(background.error.value).toBe("");
    scope.stop();
  });
});
