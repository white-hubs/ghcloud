import { describe, expect, it } from "vitest";

import { firstPageIdForSceneScopeFilter, parseSceneScopeFromPageContent, sceneScopeLabel } from "./scene-scope-meta";

describe("demo scene scope meta", () => {
  it("parses sceneScope from page content JSON", () => {
    expect(parseSceneScopeFromPageContent(JSON.stringify({ sceneScope: "multiDevice" }))).toBe("multiDevice");
    expect(parseSceneScopeFromPageContent(JSON.stringify({ sceneScope: "facilityRoom" }))).toBe("multiDevice");
    expect(parseSceneScopeFromPageContent(JSON.stringify({ sceneScope: "electricalCenter" }))).toBe("multiDevice");
    expect(parseSceneScopeFromPageContent("{}")).toBe("singleDevice");
    expect(parseSceneScopeFromPageContent("not-json")).toBe("singleDevice");
  });

  it("derives sceneScope from required device bindings when elements are present", () => {
    expect(
      parseSceneScopeFromPageContent(
        JSON.stringify({
          sceneScope: "multiDevice",
          elements: [{ deviceBinding: "required" }],
        }),
      ),
    ).toBe("singleDevice");
    expect(
      parseSceneScopeFromPageContent(
        JSON.stringify({
          sceneScope: "singleDevice",
          elements: [{ deviceBinding: "required" }, { deviceBinding: "required" }],
        }),
      ),
    ).toBe("multiDevice");
  });

  it("labels scopes in Chinese", () => {
    expect(sceneScopeLabel("singleDevice")).toBe("单设备");
    expect(sceneScopeLabel("multiDevice")).toBe("多设备");
  });

  it("selects the first page matching the switched scope", () => {
    const pages = [
      { id: "single-1", sceneScope: "singleDevice" as const },
      { id: "multi-1", sceneScope: "multiDevice" as const },
      { id: "single-2", sceneScope: "singleDevice" as const },
    ];

    expect(firstPageIdForSceneScopeFilter(pages, "all")).toBe("single-1");
    expect(firstPageIdForSceneScopeFilter(pages, "singleDevice")).toBe("single-1");
    expect(firstPageIdForSceneScopeFilter(pages, "multiDevice")).toBe("multi-1");
    expect(firstPageIdForSceneScopeFilter(pages.slice(0, 1), "multiDevice")).toBe("");
  });
});
