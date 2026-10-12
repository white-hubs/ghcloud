import { describe, expect, it } from "vitest";

import { canStartDirectPan, clampDirectPan, fitDirectScale, isDirectViewportScrollTarget } from "../src/direct-viewport";

describe("direct viewport", () => {
  it("fits a widely spread page completely into the viewport", () => {
    expect(fitDirectScale({ width: 40_000, height: 1_000 }, { width: 1_000, height: 600 })).toBe(0.025);
  });

  it("allows ordinary left-button dragging while preserving middle-button scrolling", () => {
    expect(canStartDirectPan(0, "mouse")).toBe(true);
    expect(canStartDirectPan(1, "mouse")).toBe(false);
    expect(canStartDirectPan(0, "touch")).toBe(true);
  });

  it("allows a smaller canvas to be dragged upward to reveal its lower edge", () => {
    expect(clampDirectPan({ tx: 300, ty: -250 }, { width: 400, height: 400 }, { width: 1_000, height: 600 })).toEqual({
      tx: 300,
      ty: -250,
    });
  });

  it("leaves wheel handling to an inline scroll region instead of moving the canvas", () => {
    const target = {
      closest: (selector: string) => (selector === "[data-scada-wheel-scroll]" ? target : null),
    };

    expect(isDirectViewportScrollTarget(target)).toBe(true);
    expect(isDirectViewportScrollTarget({ closest: () => null })).toBe(false);
    expect(isDirectViewportScrollTarget(null)).toBe(false);
  });
});
