import { describe, expect, test } from "bun:test";

import { extractBuildingHint, extractFloorHint, resolveFloorPerspective } from "./resolve-floor-perspective";

const floors = [
  { name: "1F", actorId: "a1" },
  { name: "2F", actorId: "a2" },
  { name: "3F", actorId: "a3" },
  { name: "屋顶花园", actorId: "a4" },
];

describe("resolveFloorPerspective", () => {
  test("matches numeric floor", () => {
    expect(resolveFloorPerspective(floors, "3")?.name).toBe("3F");
    expect(resolveFloorPerspective(floors, "3楼")?.name).toBe("3F");
  });

  test("顶层 falls back to last floor", () => {
    expect(resolveFloorPerspective(floors, "顶层")?.name).toBe("屋顶花园");
  });

  test("matches roof by name", () => {
    expect(resolveFloorPerspective(floors, "屋顶")?.name).toBe("屋顶花园");
  });

  test("miss", () => {
    expect(resolveFloorPerspective(floors, "不存在")).toBeUndefined();
  });
});

describe("extract hints", () => {
  test("reads buildingName and floor", () => {
    expect(extractBuildingHint({ buildingName: "华威一号楼", floor: "顶层" })).toBe("华威一号楼");
    expect(extractFloorHint({ buildingName: "华威一号楼", floor: "顶层" })).toBe("顶层");
  });
});
