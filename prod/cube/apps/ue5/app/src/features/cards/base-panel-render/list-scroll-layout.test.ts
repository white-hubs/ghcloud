import { describe, expect, test } from "bun:test";

import { resolveLayoutPx, resolveSnappedScrollTop } from "./list-scroll-layout";

describe("resolveLayoutPx", () => {
  test("keeps design px at 1920 scale", () => {
    expect(resolveLayoutPx(36, 1)).toBe(36);
  });

  test("matches rem-scaled row height so seamless wait stops on a whole row", () => {
    expect(resolveLayoutPx(36, 2 / 3)).toBe(24);
    expect(resolveLayoutPx(40, 0.75)).toBe(30);
  });

  test("ignores invalid design values", () => {
    expect(resolveLayoutPx(0, 1)).toBe(0);
    expect(resolveLayoutPx(-8, 1)).toBe(0);
  });
});

describe("resolveSnappedScrollTop", () => {
  test("snaps to the nearest item start instead of a clipped mid-row", () => {
    expect(resolveSnappedScrollTop(18, [0, 36, 72, 108])).toBe(36);
    expect(resolveSnappedScrollTop(10, [0, 36, 72, 108])).toBe(0);
    expect(resolveSnappedScrollTop(80, [0, 36, 72, 108])).toBe(72);
    expect(resolveSnappedScrollTop(90, [0, 36, 72, 108])).toBe(108);
  });

  test("stays put when already aligned", () => {
    expect(resolveSnappedScrollTop(72, [0, 36, 72, 108])).toBe(72);
  });
});
