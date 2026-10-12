import { describe, expect, test } from "bun:test";

import { resolveFlowNodeCanvasHeight } from "./flow";

describe("flow height hydration", () => {
  test("prefers measured height when stored height is only the default placeholder", () => {
    expect(resolveFlowNodeCanvasHeight(216, 216, 312)).toBe(312);
  });

  test("keeps stored height when it already differs from the default placeholder", () => {
    expect(resolveFlowNodeCanvasHeight(312, 216, 312)).toBe(312);
  });

  test("falls back to measured height when stored height is missing", () => {
    expect(resolveFlowNodeCanvasHeight(0, 216, 312)).toBe(312);
    expect(resolveFlowNodeCanvasHeight(undefined, 216, 312)).toBe(312);
  });
});
