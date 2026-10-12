import { describe, expect, test } from "bun:test";

import {
  BODY_FONT_SIZE,
  MIN_AXIS_FONT_PX,
  MIN_LABEL_FONT_PX,
  MIN_UI_SCALE,
  PANEL_WIDTH_DESIGN,
  PANEL_WIDTH_MIN,
  resolvePanelWidthPx,
  resolveScaledFontSize,
  resolveViewportMetrics,
} from "./viewport-metrics";

describe("resolveViewportMetrics", () => {
  test.each([
    [1920, 1080, 1, "normal"],
    [1366, 768, 1, "compact"],
    [1440, 900, 1, "compact"],
    [2560, 1440, 4 / 3, "normal"],
    [3840, 2160, 2, "normal"],
    [7680, 2160, 2, "normal"],
    [2560, 1080, 1, "normal"],
    [2800, 920, 1, "compact"],
    [1000, 600, 1, "compact"],
  ] as const)("%sx%s", (width, height, expected, mode) => {
    const metrics = resolveViewportMetrics(width, height);
    expect(metrics.uiScale).toBeCloseTo(expected, 4);
    expect(metrics.bodyFontSize).toBeCloseTo(BODY_FONT_SIZE * expected, 4);
    expect(metrics.mode).toBe(mode);
  });

  test("laptop viewports keep design-size typography instead of shrinking rem", () => {
    const metrics = resolveViewportMetrics(1440, 800);
    expect(metrics.rawScale).toBeCloseTo(800 / 1080, 4);
    expect(metrics.uiScale).toBe(1);
    expect(metrics.rootFontSize).toBe(192);
    expect(metrics.bodyFontSize).toBe(16);
    expect(metrics.mode).toBe("compact");
  });

  test("sanitizes invalid viewport dimensions", () => {
    const metrics = resolveViewportMetrics(Number.NaN, -1);
    expect(metrics.viewportWidth).toBe(0);
    expect(metrics.viewportHeight).toBe(0);
    expect(metrics.uiScale).toBe(MIN_UI_SCALE);
    expect(metrics.bodyFontSize).toBeCloseTo(BODY_FONT_SIZE * MIN_UI_SCALE, 4);
    expect(metrics.mode).toBe("compact");
  });
});

describe("resolveScaledFontSize", () => {
  test("keeps design size at 1x and scales up on large screens", () => {
    expect(resolveScaledFontSize(12, 1)).toBe(12);
    expect(resolveScaledFontSize(12, 2)).toBe(24);
  });

  test("does not let card labels fall below 12px when rem would shrink", () => {
    expect(resolveScaledFontSize(12, 2 / 3)).toBe(MIN_LABEL_FONT_PX);
    expect(resolveScaledFontSize(14, 0.75)).toBe(MIN_LABEL_FONT_PX);
    expect(resolveScaledFontSize(11, 0.7)).toBe(MIN_AXIS_FONT_PX);
  });
});

describe("panel width scale", () => {
  test("laptop keeps font scale at 1 but reports widthScale from viewport width", () => {
    const metrics = resolveViewportMetrics(1366, 768);
    expect(metrics.uiScale).toBe(1);
    expect(metrics.widthScale).toBeCloseTo(1366 / 1920, 4);
    expect(metrics.panelWidthPx).toBeCloseTo(PANEL_WIDTH_DESIGN * (1366 / 1920), 0);
    expect(metrics.panelWidthPx).toBeGreaterThanOrEqual(PANEL_WIDTH_MIN);
  });

  test("1080p panel stays 400px", () => {
    expect(resolveViewportMetrics(1920, 1080).panelWidthPx).toBe(400);
  });

  test("panel width caps at 480px on ultra-wide", () => {
    expect(resolveViewportMetrics(5120, 1440).panelWidthPx).toBe(480);
  });

  test("narrow viewport keeps a center reserve then shrinks panels", () => {
    const width = resolvePanelWidthPx(900, 900 / 1920);
    expect(width).toBeGreaterThanOrEqual(280);
    expect(2 * width + 320).toBeLessThanOrEqual(900 + 1);
  });

  test("extreme narrow still yields two panels without NaN", () => {
    const width = resolvePanelWidthPx(500, 500 / 1920);
    expect(width).toBeGreaterThanOrEqual(160);
    expect(2 * width).toBeLessThanOrEqual(500);
  });
});
