import { describe, expect, test } from "bun:test";

import { estimateInitialCardSlotDensity, resolveCardSlotDensity } from "./card-slot-density";

describe("resolveCardSlotDensity", () => {
  test.each([
    [260, "comfortable"],
    [220, "comfortable"],
    [219, "compact"],
    [0, "compact"],
  ] as const)("height=%s -> %s", (height, expected) => {
    expect(resolveCardSlotDensity(height)).toBe(expected);
  });
});

describe("estimateInitialCardSlotDensity", () => {
  test("1080p three-card panel starts comfortable at the design slot", () => {
    // 1080 - 64 - 76 = 940; (940 - 24) / 3 - 48 ≈ 257
    expect(estimateInitialCardSlotDensity(940, 3, 12, 1)).toBe("comfortable");
  });

  test("single card panel stays comfortable", () => {
    expect(estimateInitialCardSlotDensity(940, 1, 0, 1)).toBe("comfortable");
  });
});
