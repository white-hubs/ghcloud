import { describe, expect, test } from "bun:test";

import { resolvePanelLayout } from "./panel-layout-policy";

describe("resolvePanelLayout re-export", () => {
  test("exposes slot packing as the panel layout policy", () => {
    const packing = resolvePanelLayout({
      cardCount: 3,
      availableHeight: 940,
      uiScale: 1,
      profiles: [
        { weight: 1.35, slotMin: 280, slotMax: 640 },
        { weight: 1.15, slotMin: 280, slotMax: 560 },
        { weight: 1.15, slotMin: 280, slotMax: 560 },
      ],
    });
    expect(packing.visibleCount).toBe(3);
    expect(packing.mode).toBe("pack");
  });
});
