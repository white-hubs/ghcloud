import { describe, expect, it } from "vitest";

import {
  SCENE_SCOPE_KIND_LABELS,
  inferSceneScopeFromElements,
  isSceneScopeKind,
  readExplicitSceneScopeFromContent,
  readLegacySceneScopeFromContent,
  resolvePageSceneScope,
  type SceneScopeKind,
} from "./scene-scope";
import { createDefaultPage, deserializePage, serializePage } from "./serialization/page-serializer";

function createElement(id: string, deviceBinding: "off" | "required" = "off") {
  return {
    id,
    type: "test",
    deviceBinding,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    props: {},
    bindings: [],
    eventHandlers: [],
  };
}

describe("scene scope", () => {
  it("recognizes single-device and multi-device morphologies", () => {
    const kinds: SceneScopeKind[] = ["singleDevice", "multiDevice"];
    expect(kinds.every(isSceneScopeKind)).toBe(true);
    expect(isSceneScopeKind("device")).toBe(false);
    expect(SCENE_SCOPE_KIND_LABELS.singleDevice).toBe("单设备");
    expect(SCENE_SCOPE_KIND_LABELS.multiDevice).toBe("多设备");
  });

  it("defaults missing sceneScope to singleDevice for legacy product pages", () => {
    const restored = deserializePage(
      JSON.stringify({
        version: "1.1",
        id: "legacy-device",
        name: "旧设备页",
        product: { id: "prod-1", name: "漏电监测" },
      }),
    );

    expect(resolvePageSceneScope(restored)).toBe("singleDevice");
    expect(restored.sceneScope).toBe("singleDevice");
  });

  it("derives morphology from elements that require device binding", () => {
    expect(inferSceneScopeFromElements([])).toBe("singleDevice");
    expect(inferSceneScopeFromElements([createElement("off-1")])).toBe("singleDevice");
    expect(inferSceneScopeFromElements([createElement("required-1", "required")])).toBe("singleDevice");
    expect(inferSceneScopeFromElements([createElement("required-1", "required"), createElement("required-2", "required")])).toBe(
      "multiDevice",
    );
  });

  it("uses canvas elements instead of a manually stored morphology", () => {
    const restoredSingle = deserializePage(
      JSON.stringify({
        version: "1.1",
        sceneScope: "multiDevice",
        elements: [createElement("required-1", "required")],
      }),
    );
    const restoredMulti = deserializePage(
      JSON.stringify({
        version: "1.1",
        sceneScope: "singleDevice",
        elements: [createElement("required-1", "required"), createElement("required-2", "required")],
      }),
    );
    const page = createDefaultPage({
      elements: [createElement("required-1", "required"), createElement("required-2", "required")],
    });
    page.sceneScope = "singleDevice";
    const serialized = JSON.parse(serializePage(page)) as { sceneScope: SceneScopeKind };

    expect(restoredSingle.sceneScope).toBe("singleDevice");
    expect(restoredMulti.sceneScope).toBe("multiDevice");
    expect(serialized.sceneScope).toBe("multiDevice");
  });

  for (const [legacyScope, expectedScope] of [
    ["device", "singleDevice"],
    ["electricalCenter", "multiDevice"],
    ["facilityRoom", "multiDevice"],
  ] as const) {
    it(`maps legacy ${legacyScope} pages to ${expectedScope}`, () => {
      expect(resolvePageSceneScope({ sceneScope: legacyScope })).toBe(expectedScope);
      expect(readExplicitSceneScopeFromContent(JSON.stringify({ sceneScope: legacyScope }))).toBe(expectedScope);
    });
  }

  it("normalizes unknown sceneScope values to singleDevice", () => {
    const restored = deserializePage(
      JSON.stringify({
        version: "1.1",
        id: "bad-scope",
        name: "Bad",
        sceneScope: "electricalFacility",
      }),
    );
    expect(restored.sceneScope).toBe("singleDevice");
  });
});

describe("legacy scene scope compatibility", () => {
  it("reads normalized explicit scopes from stored content", () => {
    expect(readExplicitSceneScopeFromContent("{}")).toBeUndefined();
    expect(readExplicitSceneScopeFromContent(JSON.stringify({ sceneScope: "device" }))).toBe("singleDevice");
    expect(readExplicitSceneScopeFromContent(JSON.stringify({ sceneScope: "electricalCenter" }))).toBe("multiDevice");
    expect(readExplicitSceneScopeFromContent(JSON.stringify({ sceneScope: "multiDevice" }))).toBe("multiDevice");
  });

  it("reads only legacy raw values for transitional business consumers", () => {
    expect(readLegacySceneScopeFromContent(JSON.stringify({ sceneScope: "electricalCenter" }))).toBe("electricalCenter");
    expect(readLegacySceneScopeFromContent(JSON.stringify({ page: { sceneScope: "facilityRoom" } }))).toBe("facilityRoom");
    expect(readLegacySceneScopeFromContent(JSON.stringify({ sceneScope: "multiDevice" }))).toBeUndefined();
    expect(readLegacySceneScopeFromContent("not-json")).toBeUndefined();
  });
});
